import { and, count, eq, sum } from "drizzle-orm";
import { DB } from "../../db";
import { Logger } from "winston";
import { apiKey, error, project } from "../../db/schema";

export class ProjectService {
  constructor(
    private dbClient: DB,
    private logger: Logger,
  ) {}

  async getProject(project_id: string) {
    return await this.dbClient
      .select()
      .from(project)
      .where(eq(project.id, project_id));
  }
  async createNewProject(user_id: string, project_name: string) {
    const [newproject] = await this.dbClient
      .insert(project)
      .values({
        name: project_name,
        ownerId: user_id,
      })
      .returning({ id: project.id });
    return newproject;
  }
  async createNewApiKeyTable(
    project_id: string,
    apiKeyHash: string,
    apiKeyPreview: string,
  ) {
    const [newApiKey] = await this.dbClient
      .insert(apiKey)
      .values({
        projectId: project_id,
        apiKey: apiKeyHash,
        apiKeyPreview,
      })
      .returning({ id: apiKey.id });
    return newApiKey;
  }

  async getProjectWithActiveKey(project_Id: string, user_id:string) {
    const [result] = await this.dbClient
      .select({
        projectId: project.id,
        projectName: project.name,
        createdAt: project.createdAt,
        apiKeyId: apiKey.id,
        apiKeyPreview: apiKey.apiKeyPreview,
        apiKeyCreatedAt: apiKey.createdAt,
      })
      .from(project)
      .innerJoin(
        apiKey,
        and(eq(apiKey.projectId, project.id), eq(apiKey.isActive, true)),
      )
      .where(and(eq(project.id, project_Id), eq(project.ownerId, user_id)));

    return result;
  }

  async getAllProjectsWithUserId( user_id:string) {
   return await this.dbClient
    .select({
      projectId: project.id,
      projectName: project.name,
      createdAt: project.createdAt,
      // 1. Count total error rows for this project
      totalErrorRows: count(error.id),
      // 2. Sum up all event counts across those error rows
      totalEventCount: sum(error.eventCount),
    })
    .from(project)
    // Use leftJoin so projects with 0 errors still show up in the list
    .leftJoin(error, eq(error.projectId, project.id))
    // Filter by the user who owns the project (ownerId)
    .where(eq(project.ownerId, user_id))
    // Group by project fields to allow aggregate functions to run per project
    .groupBy(project.id, project.name, project.createdAt);
  }
}
