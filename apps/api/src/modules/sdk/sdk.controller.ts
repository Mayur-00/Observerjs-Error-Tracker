import { Logger } from "winston";
import { SdkService } from "./sdk.services";
import { Request, RequestHandler, Response } from "express";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  GenerateApikey,
  hashRawApikey,
} from "../../utils";

export class SdkController {
  constructor(
    private sdkServices: SdkService,
    private logger: Logger,
  ) {}

 
 
}
