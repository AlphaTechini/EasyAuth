import type { FundingRequest } from "@easyauth/shared";
import type { EasyAuthBackend } from "../config.js";
import { validationError } from "../errors.js";
import type { EasyAuthHandlerInput } from "../types.js";
import { assertRecordBody, normalizeRouteId } from "../validation.js";
import { created, errorResponse, ok } from "./response.js";

export async function handleCreateFundingOrder(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput<FundingRequest> = {}
) {
  try {
    if (!input.body) {
      throw validationError("Funding request body is required.");
    }

    const body = assertRecordBody(
      input.body,
      "Funding request body must be an object."
    ) as unknown as FundingRequest;
    const fundingOrder = await backend.services.createFundingOrder({
      ...input,
      ...body
    });
    return created(fundingOrder);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleGetFundingStatus(
  backend: EasyAuthBackend,
  input: EasyAuthHandlerInput<unknown, { id?: string }> = {}
) {
  try {
    const fundingId = normalizeRouteId(input.params?.id, "fundingId");

    const fundingOrder = await backend.services.getFundingStatus({
      ...input,
      fundingId
    });
    return ok(fundingOrder);
  } catch (error) {
    return errorResponse(error);
  }
}
