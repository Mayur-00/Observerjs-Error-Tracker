import { and, desc, eq } from "drizzle-orm";
import { DB } from "../../db";
import { error, project } from "../../db/schema";
import { ErrorState, IErrorRepository } from "./error.types.js";

export class ErrorRepository implements IErrorRepository {
  constructor(private dbClient: DB) {}

  async getErrorById(error_id: string, user_id: string) {
    const [errorRecord] = await this.dbClient
      .select()
      .from(error)
      .innerJoin(project, eq(error.projectId, project.id))
      .where(and(eq(error.id, error_id), eq(project.ownerId, user_id)))
      .limit(1);

    return errorRecord?.error ?? null;
  }

  async updateErrorState(
    error_id: string,
    state: ErrorState,
    user_id: string,
  ) {
    const ownedError = await this.getErrorState(error_id, user_id);
    if (!ownedError) return undefined;

    const [updatedError] = await this.dbClient
      .update(error)
      .set({ state })
      .where(eq(error.id, error_id))
      .returning({ id: error.id, state:error.state});

    return updatedError;
  }
  async getErrorState(error_id: string, user_id: string) {
    const [errorRecord] = await this.dbClient
      .select({ state: error.state })
      .from(error)
      .innerJoin(project, eq(error.projectId, project.id))
      .where(and(eq(error.id, error_id), eq(project.ownerId, user_id)))
      .limit(1);
    return errorRecord;
  }

  async getProjectErrors(project_id: string, user_id: string) {
    return this.dbClient
      .select({
        id: error.id,
        errorType: error.errorType,
        message: error.message,
        eventCount: error.eventCount,
        state: error.state,
        lastSeen: error.lastSeen,
        environment: error.environment,
        filePath: error.filePath,
      })
      .from(error)
      .innerJoin(project, eq(error.projectId, project.id))
      .where(and(eq(project.id, project_id), eq(project.ownerId, user_id)))
      .orderBy(desc(error.lastSeen));
  }
}
