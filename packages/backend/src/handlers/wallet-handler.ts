import type { EasyAuthBackend } from "../config.js";
import type { CreateWalletServiceInput, EasyAuthHandlerInput } from "../types.js";
import { assertRecordBody } from "../validation.js";
import { created, errorResponse, ok } from "./response.js";

export async function handleGetWallet(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput = {}
) {
  try {
    const wallet = await backend.services.getWallet(input);
    return ok(wallet);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleCreateWallet(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput<CreateWalletServiceInput> = {}
) {
  try {
    const body =
      input.body === undefined
        ? {}
        : assertRecordBody(input.body, "Wallet request body must be an object.");
    const wallet = await backend.services.createWallet({
      ...input,
      ...body
    });
    return created(wallet);
  } catch (error) {
    return errorResponse(error);
  }
}
