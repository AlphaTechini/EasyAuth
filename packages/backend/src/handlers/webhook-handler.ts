import type { EasyAuthBackend } from "../config.js";
import { validationError } from "../errors.js";
import type { EasyAuthHandlerInput } from "../types.js";
import { errorResponse, ok } from "./response.js";

export async function handleWebhook(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput = {}
) {
  try {
    if (input.body === undefined) {
      throw validationError("Webhook request body is required.");
    }

    const result = await backend.services.processWebhook({
      headers: input.headers,
      body: input.body,
      rawBody: input.rawBody
    });

    return ok(result);
  } catch (error) {
    return errorResponse(error);
  }
}
