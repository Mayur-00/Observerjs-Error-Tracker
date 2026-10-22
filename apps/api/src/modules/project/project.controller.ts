import { Logger } from "winston";

import { Request, RequestHandler, Response } from "express";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  GenerateApikey,
  hashRawApikey,
} from "../../utils";
import { createProjectSchema, getProjectSchema } from "./project.dto.js";
import { ProjectService } from "./project.services";

export class ProjectController {
  constructor(
    private projectServices: ProjectService,
    private logger: Logger,
  ) {}

  createProject: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user;

      if (user === undefined) {
        this.logger.error("unauthorized Request");
        throw new ApiError(401, "Unauthorized");
      }

      const { name } = createProjectSchema.parse(req.body);

      const createdProject = await this.projectServices.createNewProject(
        user.id,
        name,
      );

      if (createdProject === undefined) {
        this.logger.error("Failed To Create Project");
        throw new ApiError(500, "internal server error");
      }

      const apiKeyObj = GenerateApikey(createdProject.id);
      const apiKeyHash = hashRawApikey(apiKeyObj.rawkey);

      const newApiKeyTable = await this.projectServices.createNewApiKeyTable(
        createdProject.id,
        apiKeyHash,
        apiKeyObj.preview
      );

      if (newApiKeyTable === undefined) {
        this.logger.error("Failed To Entry new ApiKey To the Db");
        throw new ApiError(500, "internal server error");
      }

      this.logger.info("A new project Created Successfully");
      res
        .status(201)
        .json(new ApiResponse(200, { apikey: apiKeyObj.rawkey }, "Success"));
    },
  );
  getProject: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user;

      if (user === undefined) {
        this.logger.error("unauthorized Request");
        throw new ApiError(401, "Unauthorized");
      }

      const { project_id } = getProjectSchema.parse(req.body);

      const createdProject = await this.projectServices.createNewProject(
        user.id,
        name,
      );

      if (createdProject === undefined) {
        this.logger.error("Failed To Create Project");
        throw new ApiError(500, "internal server error");
      }

      const rawApiKey = GenerateApikey(createdProject.id);
      const apiKeyHash = hashRawApikey(rawApiKey);

      const newApiKeyTable = await this.projectServices.createNewApiKeyTable(
        createdProject.id,
        apiKeyHash,
      );

      if (newApiKeyTable === undefined) {
        this.logger.error("Failed To Entry new ApiKey To the Db");
        throw new ApiError(500, "internal server error");
      }

      this.logger.info("A new project Created Successfully");
      res
        .status(201)
        .json(new ApiResponse(200, { apikey: rawApiKey }, "Success"));
    },
  );
}
