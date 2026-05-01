import { DEFAULT_EASYAUTH_ENDPOINTS } from "./constants.js";

export type EasyAuthEndpointName = keyof typeof DEFAULT_EASYAUTH_ENDPOINTS;

export type EasyAuthApiEndpoints = Record<EasyAuthEndpointName, string>;

export function mergeEasyAuthEndpoints(
  endpoints: Partial<EasyAuthApiEndpoints> = {}
): EasyAuthApiEndpoints {
  return {
    ...DEFAULT_EASYAUTH_ENDPOINTS,
    ...endpoints
  };
}

export function createFundingStatusPath(pathPattern: string, fundingId: string) {
  return pathPattern.replace(":id", encodeURIComponent(fundingId));
}
