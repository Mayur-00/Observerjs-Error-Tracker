import { NextFunction, Request, Response } from "express";
import { ApiError, IApiError } from "../utils/apiErrorClass.js";
import { ZodError } from "zod";
import {logger} from "../config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * Automatically captures exceptions and constructs an well formated response object and sends that object as response .
 */
export const handleError = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: IApiError | Error | ZodError | unknown = err;

  const IsInDevelopment = process.env.NODE_ENV === "development";

  // if this error is unexpected
  if (!(error instanceof ApiError)) {
    // if this is validation error
    if (error instanceof ZodError) {
      const statusCode = 400;

      const message =
        (error as ZodError).issues[0]?.message ?? "Validation error";

      const errors = (error as ZodError).issues || [];

      error = new ApiError(
        statusCode,
        message,
        "INPUT_VALIDATION_ERROR",
        errors,
        error.stack,
      );

      logger.error(`Input Validation Error : ${error}`);
    } else {
      const statusCode = (error as { statusCode?: number })?.statusCode ?? 500;
      const message =
        (error as { message?: string })?.message ?? "Something Went Wrong";
      const error_code = "SERVER_ERROR";

      error = new ApiError(
        statusCode,
        message,
        error_code,
        (error as { errors?: unknown[] })?.errors ?? [],
        (error as { stack?: string })?.stack,
      );
      logger.error(`Implementation error : ${error}`);
    }
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

export type ResponseType = {
  success: boolean;
  message: string;
  errors: unknown[];
  error_code?: string;
  stack?: string;
  data?: object;
};
