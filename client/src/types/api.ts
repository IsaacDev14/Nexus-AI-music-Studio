export interface APIError {
  detail: string;
  status: number;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface APIInfoResponse {
  name: string;
  version: string;
  endpoints: string[];
}
