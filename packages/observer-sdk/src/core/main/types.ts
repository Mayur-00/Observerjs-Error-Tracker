export interface TrackerConfig {
  apiKey: string;
  endpoint: string;
  environment: string;
}
export interface ErrorPayload {
  errorContext: IErrorContext;
  deviceContext: IDeviceContext;
  reqContext?: IReqContext;
  timestamp: string;
}

export interface IReqContext {
  method: string;
  route: string;
  userAgent: string | null;
}

export interface IErrorContext {
  errorType: string;
  message: string;
  stackTrace: string;
  filePath: string;
  errorLineNumber: number;
  errorColomnNumber: number;
}
export interface IDeviceContext {
  os: NodeJS.Platform;
  osVersion: string;
  platform: string;
  platformVersion: string;
  environment: string;
}
