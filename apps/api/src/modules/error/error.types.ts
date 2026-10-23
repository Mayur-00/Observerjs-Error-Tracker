
import { RequestHandler } from "express";
import { error } from "../../db/schema";

// Infer the error table type
type ErrorTable = typeof error.$inferSelect;
type ErrorId = ErrorTable["id"];
export type ErrorState = (typeof error.state.enumValues)[number];

export interface IErrorRepository {
  getErrorById: (error_id: string, user_id: string) => Promise<ErrorTable | null>;
  updateErrorState: (
    error_id: string,
    state: ErrorState,
    user_id: string,
  ) => Promise<{ id: ErrorId, state:ErrorState } | undefined>;
  getErrorState: (
    error_id: string,
    user_id: string,
  ) => Promise<{state: ErrorState} | undefined>;
  getProjectErrors: (
    project_id: string,
    user_id: string,
  ) => Promise<
    {
      id: ErrorId;
      errorType: string;
      message: string;
      eventCount: number;
      state: ErrorState;
      lastSeen: Date;
      environment: string;
      filePath: string;
    }[]
  >;
}

export interface IErrorService {
  getError: (error_id: string, user_id: string) => Promise<ErrorTable>;
  updateState: (error_id: string, user_id: string) => Promise<{state:ErrorState}>;
  getProjectErrors: (project_id: string, user_id: string) => Promise<
    {
      id: ErrorId;
      errorType: string;
      message: string;
      eventCount: number;
      state: ErrorState;
      lastSeen: Date;
      environment: string;
      filePath: string;
    }[]
  >;
};

export interface IErrorController {
  getError: RequestHandler
  updateState: RequestHandler
  getProjectErrors: RequestHandler
};
