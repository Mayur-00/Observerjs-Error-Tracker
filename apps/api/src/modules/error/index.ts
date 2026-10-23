import { logger } from "../../config";
import { db } from "../../db";
import { ErrorController } from "./error.controller.js";
import { ErrorRepository } from "./error.repository.js";
import { createErrorRoutes } from "./error.router.js";
import { ErrorService } from "./error.service.js";


export const errorRepository = new ErrorRepository(db);
export const errorService = new ErrorService(errorRepository, logger);
export const errorController = new ErrorController(errorService);
export const errorRoutes =  createErrorRoutes(errorController);

export * from './error.types.js';