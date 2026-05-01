import type { EasyAuthErrorCode, EasyAuthErrorResponse } from "@easyauth/shared";

export class EasyAuthBackendError extends Error {
  readonly code: EasyAuthErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(error: EasyAuthErrorResponse) {
    super(error.message);
    this.name = "EasyAuthBackendError";
    this.code = error.code;
    this.status = error.status ?? 500;
    this.details = error.details;
  }
}

export function unauthorized(message = "Authentication is required.") {
  return new EasyAuthBackendError({
    code: "unauthorized",
    message,
    status: 401
  });
}

export function notFound(message = "The requested EasyAuth resource was not found.") {
  return new EasyAuthBackendError({
    code: "not_found",
    message,
    status: 404
  });
}

export function validationError(message: string, details?: unknown) {
  return new EasyAuthBackendError({
    code: "validation_error",
    message,
    status: 400,
    details
  });
}

export function providerError(message: string, details?: unknown) {
  return new EasyAuthBackendError({
    code: "provider_error",
    message,
    status: 502,
    details
  });
}

export function toErrorResponse(error: unknown): EasyAuthErrorResponse {
  if (error instanceof EasyAuthBackendError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details
    };
  }

  return {
    code: "unknown_error",
    message: "EasyAuth backend request failed.",
    status: 500
  };
}
