const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  createdAt: string;
  totalErrorRows: number;
  totalEventCount: number | string | null;
}

export interface ProjectDetails {
  projectId: string;
  projectName: string;
  createdAt: string;
  apiKeyId: string;
  apiKeyPreview: string;
  apiKeyCreatedAt: string;
}

export interface ProjectErrorSummary {
  id: string;
  errorType: string;
  message: string;
  eventCount: number;
  state: "unresolved" | "resolved";
  lastSeen: string;
  environment: string;
  filePath: string;
}

export interface ErrorDetails extends ProjectErrorSummary {
  errorHash: string;
  stack: string;
  projectId: string;
  userOs: string | null;
  userBrowser: string | null;
  reqPath: string | null;
  reqMethod: string | null;
  device: string;
  deviceVersion: string;
  platform: string;
  platformVersion: string;
  firstSeen: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = (await response.json()) as ApiResponse<T> & {
    error?: string;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message || result.error || "The request failed.");
  }

  return result.data;
}
