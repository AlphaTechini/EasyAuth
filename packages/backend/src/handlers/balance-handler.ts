import type { EasyAuthBackend } from "../config.js";
import type { EasyAuthHandlerInput } from "../types.js";
import { errorResponse, ok } from "./response.js";

export async function handleGetWalletBalance(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput = {}
) {
  try {
    const balance = await backend.services.getWalletBalance(input);
    return ok(balance);
  } catch (error) {
    return errorResponse(error);
  }
}
