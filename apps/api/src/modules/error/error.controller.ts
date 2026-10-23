import { Request, RequestHandler, Response } from "express";
import { IErrorService } from "./error.types";
import { ApiError, ApiResponse, asyncHandler } from "../../utils";
import { errorIdSchema, errorProjectSchema } from "./error.dto";

export class ErrorController{
    constructor(private service:IErrorService){};

    private getUserId(req: Request) {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
        return req.user.id;
    }

    getProjectErrors:RequestHandler = asyncHandler(async(req:Request, res:Response) =>{
        const { project_id } = errorProjectSchema.parse(req.params);
        const errors = await this.service.getProjectErrors(
            project_id,
            this.getUserId(req),
        );

        res.status(200).json(new ApiResponse(200, errors, "Success"));
    });

    getError:RequestHandler = asyncHandler(async(req:Request, res:Response) =>{
        const {id} = errorIdSchema.parse(req.params);

        const errorTable = await this.service.getError(id, this.getUserId(req));

        res.status(200).json(new ApiResponse(200, errorTable, "Success"));
    });

    updateState:RequestHandler = asyncHandler(async (req:Request, res:Response) => {
         const {id} = errorIdSchema.parse(req.body);
         const result = await this.service.updateState(id, this.getUserId(req));

         res.status(200).json(new ApiResponse(200,result, 'success'))
    } )
}