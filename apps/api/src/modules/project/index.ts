import {logger} from "../../config";
import { db } from "../../db/index.js";
import { ProjectController } from "./project.controller.js";
import { createProjectRouts } from "./project.routes.js";
import { ProjectService } from "./project.services.js";

export * from "./project.types.js";
export * from './project.dto.js';

export const projectServices = new ProjectService(db, logger);

export const projectController = new ProjectController(projectServices, logger);

export const projectRoutes = createProjectRouts(projectController);