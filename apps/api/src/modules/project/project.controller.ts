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
        apiKeyObj.preview,
      );

      if (newApiKeyTable === undefined) {
        this.logger.error("Failed To Entry new ApiKey To the Db");
        throw new ApiError(500, "internal server error");
      }

      this.logger.info("A new project Created Successfully");
      res
        .status(201)
        .json(new ApiResponse(201, { apikey: apiKeyObj.rawkey, endpoint:`${process.env.DOMIAN}/api/v1/sdk` }, "Success"));
    },
  );
  getProject: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user;

      if (user === undefined) {
        this.logger.error("unauthorized Request");
        throw new ApiError(401, "Unauthorized");
      }

      const { project_id } = getProjectSchema.parse(req.params);

      const fetchedProject = await this.projectServices.getProjectWithActiveKey(
        project_id,
        user.id,
      );

      if (fetchedProject === undefined) {
        this.logger.error(`Project Not Found`);
        throw new ApiError(404, "Project Not Fount");
      }

      this.logger.info(" project found successfully");
      res.status(200).json(new ApiResponse(200, fetchedProject, "Success"));
    },
  );
  getAllProjects: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user;

      if (user === undefined) {
        this.logger.error("unauthorized Request");
        throw new ApiError(401, "Unauthorized");
      }

      const fetchedProject =
        await this.projectServices.getAllProjectsWithUserId(user.id);

      this.logger.info(" project found successfully");
      res.status(200).json(new ApiResponse(200, fetchedProject, "Success"));
    },
  );
}
