import {logger} from "../../config";
import { db } from "../../db/index.js";
import { SdkController } from "./sdk.controller.js";
import { createSdkRoutes } from "./sdk.routes.js";
import { SdkService } from "./sdk.services.js";

export * from "./sdk.types.js";
export * from './sdk.dto.js';

export const sdkServices = new SdkService(db, logger);

export const sdkController = new SdkController(sdkServices, logger);

export const sdkRoutes = createSdkRoutes(sdkController);