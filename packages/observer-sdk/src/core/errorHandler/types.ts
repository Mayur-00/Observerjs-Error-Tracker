 export interface IApiError {
  statusCode: number;
  message: string;
  data: unknown | null;
  success: boolean;
  errors: unknown[];
  error_code?: string;
  stack?: string | undefined;
}