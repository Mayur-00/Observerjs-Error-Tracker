import { Logger } from "winston";
import { IErrorRepository, IErrorService } from "./error.types.js";
import { ApiError } from "../../utils";

export class ErrorService implements IErrorService  {
  constructor(private repo:IErrorRepository, private logger:Logger){};

  async getError(error_id:string, user_id: string){
    const result = await this.repo.getErrorById(error_id, user_id);

    if(!result){
        this.logger.error("error not found");
        throw new ApiError(404, 'Error Not Found')
    }
    return result
  };
  async updateState(error_id:string, user_id: string){
    const existingState = await this.repo.getErrorState(error_id, user_id);
    if(!existingState){
        this.logger.error("error table not found");
        throw new ApiError(404, "Error Not Found");
    };

    const nextState = existingState.state === "resolved" ? "unresolved" : "resolved";
    const result = await this.repo.updateErrorState(error_id, nextState, user_id);

    if(!result){
      this.logger.error("Failed to update Error State");
      throw new ApiError(500, 'Internal Api Error')
    }
    return {state:result.state};
  }

  async getProjectErrors(project_id: string, user_id: string) {
    return this.repo.getProjectErrors(project_id, user_id);
  }

}