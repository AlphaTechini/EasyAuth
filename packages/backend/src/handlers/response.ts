import { toErrorResponse } from "../errors.js";
import type { EasyAuthHandlerResponse } from "../types.js";

export function ok<TBody>(body: TBody): EasyAuthHandlerResponse<TBody> {
  return {
    status: 200,
    body
  };
}

export function created<TBody>(body: TBody): EasyAuthHandlerResponse<TBody> {
  return {
    status: 201,
    body
  };
}

export function errorResponse(error: unknown): EasyAuthHandlerResponse {
  const body = toErrorResponse(error);

  return {
    status: body.status ?? 500,
    body
  };
}
