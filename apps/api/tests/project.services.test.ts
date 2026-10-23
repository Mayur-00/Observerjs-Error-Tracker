import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Logger } from "winston";
import type { DB } from "../src/db";
import { apiKey, project } from "../src/db/schema";
import { ProjectService } from "../src/modules/project/project.services";

interface QueryBuilder {
  from: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  innerJoin: ReturnType<typeof vi.fn>;
  leftJoin: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
  then: (
    resolve: (value: unknown) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise<unknown>;
}

function createDbMock(result: unknown) {
  const query = {} as QueryBuilder;
  query.from = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.innerJoin = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.groupBy = vi.fn(() => query);
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);

  const returning = vi.fn().mockResolvedValue(result);
  const values = vi.fn().mockReturnValue({ returning });
  const select = vi.fn().mockReturnValue(query);
  const insert = vi.fn().mockReturnValue({ values });

  return {
    client: { select, insert } as unknown as DB,
    query,
    returning,
    values,
    select,
    insert,
  };
}

describe("ProjectService", () => {
  let service: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns projects matching the requested project ID", async () => {
    const projects = [{ id: "project-1", name: "Observer" }];
    const db = createDbMock(projects);
    service = new ProjectService(db.client, {} as Logger);

    await expect(service.getProject("project-1")).resolves.toEqual(projects);

    expect(db.select).toHaveBeenCalledOnce();
    expect(db.query.from).toHaveBeenCalledWith(project);
    expect(db.query.where).toHaveBeenCalledOnce();
  });

  it("creates a project for the specified owner", async () => {
    const createdProject = { id: "project-1" };
    const db = createDbMock([createdProject]);
    service = new ProjectService(db.client, {} as Logger);

    await expect(
      service.createNewProject("user-1", "Observer"),
    ).resolves.toEqual(createdProject);

    expect(db.insert).toHaveBeenCalledWith(project);
    expect(db.values).toHaveBeenCalledWith({
      name: "Observer",
      ownerId: "user-1",
    });
    expect(db.returning).toHaveBeenCalledOnce();
  });

  it("creates an API key record for the specified project", async () => {
    const createdKey = { id: "key-1" };
    const db = createDbMock([createdKey]);
    service = new ProjectService(db.client, {} as Logger);

    await expect(
      service.createNewApiKeyTable("project-1", "hashed-key", "obs_abc"),
    ).resolves.toEqual(createdKey);

    expect(db.insert).toHaveBeenCalledWith(apiKey);
    expect(db.values).toHaveBeenCalledWith({
      projectId: "project-1",
      apiKey: "hashed-key",
      apiKeyPreview: "obs_abc",
    });
    expect(db.returning).toHaveBeenCalledOnce();
  });

  it("returns an owned project's active API key details", async () => {
    const details = {
      projectId: "project-1",
      projectName: "Observer",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      apiKeyId: "key-1",
      apiKeyPreview: "obs_abc",
      apiKeyCreatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };
    const db = createDbMock([details]);
    service = new ProjectService(db.client, {} as Logger);

    await expect(
      service.getProjectWithActiveKey("project-1", "user-1"),
    ).resolves.toEqual(details);

    expect(db.query.from).toHaveBeenCalledWith(project);
    expect(db.query.innerJoin).toHaveBeenCalledOnce();
    const joinConditionArg = db.query.innerJoin.mock.calls[0]?.[1];
    if (joinConditionArg === undefined) {
      throw new Error("Expected the active API key join condition");
    }
    const joinCondition = new PgDialect().sqlToQuery(joinConditionArg).sql;
    expect(joinCondition).toContain('"project_id" = "project"."id"');
    expect(db.query.where).toHaveBeenCalledOnce();
  });

  it("returns grouped error totals for all projects owned by a user", async () => {
    const projects = [
      {
        projectId: "project-1",
        projectName: "Observer",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        totalErrorRows: 2,
        totalEventCount: 5,
      },
    ];
    const db = createDbMock(projects);
    service = new ProjectService(db.client, {} as Logger);

    await expect(service.getAllProjectsWithUserId("user-1")).resolves.toEqual(
      projects,
    );

    expect(db.query.from).toHaveBeenCalledWith(project);
    expect(db.query.leftJoin).toHaveBeenCalledOnce();
    expect(db.query.where).toHaveBeenCalledOnce();
    expect(db.query.groupBy).toHaveBeenCalledOnce();
  });
});
