export type EasyAuthErrorCode =
  | "configuration_error"
  | "network_error"
  | "unauthorized"
  | "not_found"
  | "provider_error"
  | "validation_error"
  | "unknown_error";

export interface EasyAuthErrorResponse {
  code: EasyAuthErrorCode;
  message: string;
  status?: number;
  details?: unknown;
}

export class EasyAuthError extends Error {
  readonly code: EasyAuthErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(error: EasyAuthErrorResponse) {
    super(error.message);
    this.name = "EasyAuthError";
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}
