import { Logger } from "winston";
import { SdkService } from "./sdk.services";
import { Request, RequestHandler, Response } from "express";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
} from "../../utils";
import { errorPayloadSchema } from "./sdk.dto";

export class SdkController {
  constructor(
    private sdkServices: SdkService,
    private logger: Logger,
  ) {}

  createOrIncreamentError: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const projectId = req.sdkSession?.projectId;

      if (!projectId) {
        this.logger.error("unauthorized request on error ingestion");
        throw new ApiError(401, "UnAuthorized!");
      }

      const { deviceContext, errorContext, timestamp, reqContext } =
        errorPayloadSchema.parse(req.body);

      const errorHashKey = this.sdkServices.createErrorHashKey(
        errorContext.errorType,
        errorContext.filePath,
      );

      const existingErrorRow = await this.sdkServices.getErrorWithHashKey(
        errorHashKey,
        projectId,
      );

      if (existingErrorRow === undefined) {
        const result = await this.sdkServices.createNewErrorRow(
          projectId,
          new Date(timestamp),
          errorHashKey,
          errorContext,
          deviceContext,
          reqContext
        );
        if (result === undefined) {
          this.logger.error("Failed To increament eventCount in a error row");
          throw new ApiError(500, "Internal Server Error");
        }

        res.status(200).json(new ApiResponse(200, [], "success"));
      } else {
        const result = await this.sdkServices.increateEventCountInErrorRow(
          existingErrorRow.id,
        );

        if (result === undefined) {
          this.logger.error("Failed To increament eventCount in a error row");
          throw new ApiError(500, "Internal Server Error");
        }

        res.status(200).json(new ApiResponse(200, [], "success"));
      }
    },
  );
  

}
