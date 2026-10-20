export interface TrackerConfig {
  apiKey: string;
  endpoint: string;
  environment?: string;
};
export interface ErrorPayload {
  apiKey: string;
  message: string;
  name:string;
  stack?: string;
  location?:string;
  environment: string;
  timestamp: string;
  userAgent?: string;
  context?:ReqContext
}

export interface TrackerConfig {
  apiKey: string;
  endpoint: string;
  environment?: string;
  enabled?: boolean;
};
export interface ReqContext {
  method:string;
  route:string
  userAgent:string | null;
};
