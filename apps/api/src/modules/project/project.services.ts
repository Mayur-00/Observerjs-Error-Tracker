import { and, eq } from "drizzle-orm";
import { DB } from "../../db";
import { Logger } from "winston";
import { apiKey, project } from "../../db/schema";

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

  async getProjectWithActiveKeysSql(project_Id: string) {
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
        and(eq(apiKey.projectId, apiKey.id), eq(apiKey.isActive, true)),
      )
      .where(eq(project.id, project_Id));

    return result;
  }
}
