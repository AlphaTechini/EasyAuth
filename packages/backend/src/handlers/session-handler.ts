import type { EasyAuthBackend } from "../config.js";
import type { EasyAuthHandlerInput } from "../types.js";
import { errorResponse, ok } from "./response.js";

export async function handleSession(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput = {}
) {
  try {
    const session = await backend.services.getSession(input);
    return ok(session);
  } catch (error) {
    return errorResponse(error);
  }
}
