import { NextFunction, Request, Response } from "express";

import {  IApiError } from "./types.js";
import { ErrorTracker } from "../main/index.js";
import { ApiError } from "./apiClass.js";



 /**
   * Automatically captures unhandled exceptions and also returns structured Api Response
   */
export function ExpressMiddleware(client: ErrorTracker) {
return (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: IApiError | Error | unknown = err;

  const IsInDevelopment = process.env.NODE_ENV === "development";

  if (!(error instanceof ApiError)) {
    const statusCode = (error as { statusCode?: number })?.statusCode ?? 500;
    const message =
      (error as { message?: string })?.message ?? "Something Went Wrong";
    const error_code = "SERVER_ERROR";

    if (statusCode === 500) {
      const context = {
        method: _req.method, // e.g., "POST", "GET"
        route: _req.originalUrl || _req.path, // e.g., "/api/users"

        userAgent: _req.get("user-agent")!,
      };
      client.captureException((error as Error), context);
    }
    // stream error to sentry only when it's an unhandled internal server error
    error = new ApiError(
      statusCode,
      message,
      error_code,
      (error as { errors?: unknown[] })?.errors ?? [],
      (error as { stack?: string })?.stack,
    );
  }

  const errorObj = error as ApiError;

  const response: ResponseType = {
    success: false,
    message: errorObj.message,
    error_code: errorObj.error_code,
    errors: errorObj.errors || [],
    stack: undefined,
  };

  if (IsInDevelopment) response.stack = errorObj.stack;

  res.status(errorObj.statusCode || 500).json(response);
};
}

export type ResponseType = {
  success: boolean;
  message: string;
  errors: unknown[];
  error_code?: string;
  stack?: string;
  data?: object;
};
