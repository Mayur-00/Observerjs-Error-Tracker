import { and, eq, exists, sql } from "drizzle-orm";
import { DB } from "../../db";
import { Logger } from "winston";
import { apiKey, error, project } from "../../db/schema";
import crypto from "node:crypto";
import { IDeviceContext, IErrorContext, IReqContext } from "./sdk.types";
import DeviceDetector from "node-device-detector";

export class SdkService {
  constructor(
    private dbClient: DB,
    private logger: Logger,
  ) {}

  createErrorHashKey(error_type: string, error_path: string) {
    const combined = `${error_type}_${error_path}}`;
    return crypto.createHash("sha256").update(combined).digest("hex");
  }

  async getErrorWithHashKey(error_hash_key: string, project_id: string) {
    const [existing] = await this.dbClient
      .select({ id: error.id })
      .from(error)
      .where(
        and(
          eq(error.errorHash, error_hash_key),
          eq(error.projectId, project_id),
        ),
      );

    return existing;
  }
  async increateEventCountInErrorRow(error_row_id: string) {
    const [existing] = await this.dbClient
      .update(error)
      .set({ eventCount: sql`${error.eventCount} + 1` })
      .where(eq(error.id, error_row_id))
      .returning({ id: error.id });
    return existing;
  }

  async createNewErrorRow(
    project_id: string,
    errorTimeStamp: Date,
    error_hash: string,
    errorContext: IErrorContext,
    deviceContext: IDeviceContext,
    reqContext?: IReqContext,
  ) {
    if (!reqContext) {
      const [result] = await this.dbClient
        .insert(error)
        .values({
          errorHash: error_hash,
          errorType: errorContext.errorType,
          filePath: errorContext.filePath,
          message: errorContext.message,
          stack: errorContext.stackTrace,
          projectId: project_id,
          environment: deviceContext.environment,
          device: deviceContext.os,
          deviceVersion: deviceContext.osVersion,
          platform: deviceContext.platform,
          platformVersion: deviceContext.platformVersion,
          eventCount: 1,
          state: "unresolved",
          createdAt: errorTimeStamp,
        })
        .returning({ id: error.id });

      return result;
    } else {
      const userAgentInfo = this.getUserAgentInfo(reqContext.userAgent!);
      const [result] = await this.dbClient
        .insert(error)
        .values({
          errorHash: error_hash,
          errorType: errorContext.errorType,
          filePath: errorContext.filePath,
          message: errorContext.message,
          stack: errorContext.stackTrace,
          projectId: project_id,
          environment: deviceContext.environment,
          device: deviceContext.os,
          deviceVersion: deviceContext.osVersion,
          platform: deviceContext.platform,
          platformVersion: deviceContext.platformVersion,
          eventCount: 1,
          userOs: userAgentInfo.userOs,
          userBrowser: userAgentInfo.userBrowser,
          reqMethod: reqContext.method,
          reqPath: reqContext.route,
          state: "unresolved",
          createdAt: errorTimeStamp,
        })
        .returning({ id: error.id });

      return result;
    }
  }

  getUserAgentInfo(user_agent: string) {
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      osIndexes: true,
      deviceAliasCode: false,
      deviceTrusted: false,
      deviceInfo: false,
      maxUserAgentSize: 500,
    });

    const result = detector.detect(user_agent);

    return {
      userOs: result.os.name,
      userBrowser: result.client.name,
    };
  }
}
