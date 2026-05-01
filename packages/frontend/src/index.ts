import { EASYAUTH_SHARED_PACKAGE } from "@easyauth/shared";

export const EASYAUTH_FRONTEND_PACKAGE = "@easyauth/frontend";

export function getFrontendPackageInfo() {
  return {
    name: EASYAUTH_FRONTEND_PACKAGE,
    sharedPackage: EASYAUTH_SHARED_PACKAGE
  };
}

export * from "./api-client.js";
export * from "./client.js";
export * from "./events.js";
export * from "./snapshot.js";
export * from "./theme.js";
export * from "./types.js";
export { EasyAuthError } from "@easyauth/shared";
export type {
  EasyAuthErrorCode,
  EasyAuthErrorResponse,
  EasyAuthEmbeddedCheckout,
  EasyAuthFundingOrder,
  EasyAuthSession,
  EasyAuthUser,
  EasyAuthWallet,
  FundingDeliveryStatus,
  FundingCheckoutMode,
  FundingPaymentStatus,
  FundingRequest,
  FundingStatus,
  WalletStatus
} from "@easyauth/shared";
