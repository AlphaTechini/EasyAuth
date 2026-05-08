import type { EasyAuthBackend } from "../config.js";
import type { EasyAuthHandlerInput } from "../types.js";
import { errorResponse, ok } from "./response.js";

export async function handleGetFundingHistory(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput = {}
) {
  try {
    // Parse optional pagination query params from the URL if present.
    // Fastify puts query params in params; we read them defensively.
    const params = input.params ?? {};
    const limit = parseIntParam(params["limit"], 20);
    const offset = parseIntParam(params["offset"], 0);

    const result = await backend.services.getFundingHistory({
      ...input,
      limit,
      offset
    });

    return ok(result);
  } catch (error) {
    return errorResponse(error);
  }
}

function parseIntParam(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
