import { DEFAULT_EASYAUTH_ENDPOINTS } from "@easyauth/shared";
import type { FundingRequest } from "@easyauth/shared";
import type { EasyAuthBackend } from "../config.js";
import type {
  CreateWalletServiceInput,
  EasyAuthHandlerInput,
  EasyAuthHandlerResponse
} from "../types.js";
import { handleGetWalletBalance } from "./balance-handler.js";
import { handleCreateFundingOrder, handleGetFundingStatus } from "./funding-handler.js";
import { handleGetFundingHistory } from "./history-handler.js";
import { handleSession } from "./session-handler.js";
import { handleCreateWallet, handleGetWallet } from "./wallet-handler.js";
import { handleWebhook } from "./webhook-handler.js";

export type EasyAuthHttpMethod = "GET" | "POST";

export type EasyAuthRouteName =
  | "session"
  | "wallet"
  | "createWallet"
  | "walletBalance"
  | "fundingOrders"
  | "fundingStatus"
  | "fundingHistory"
  | "crossmintWebhook";

export interface EasyAuthRouteContract {
  name: EasyAuthRouteName;
  method: EasyAuthHttpMethod;
  path: string;
  handle(
    backend: EasyAuthBackend,
    input: EasyAuthHandlerInput
  ): Promise<EasyAuthHandlerResponse>;
}

export const EASYAUTH_BACKEND_ROUTES = [
  {
    name: "session",
    method: "GET",
    path: DEFAULT_EASYAUTH_ENDPOINTS.session,
    handle: handleSession
  },
  {
    name: "wallet",
    method: "GET",
    path: DEFAULT_EASYAUTH_ENDPOINTS.wallet,
    handle: handleGetWallet
  },
  {
    name: "createWallet",
    method: "POST",
    path: DEFAULT_EASYAUTH_ENDPOINTS.createWallet,
    handle: (backend, input) =>
      handleCreateWallet(backend, input as EasyAuthHandlerInput<CreateWalletServiceInput>)
  },
  {
    name: "walletBalance",
    method: "GET",
    path: DEFAULT_EASYAUTH_ENDPOINTS.walletBalance,
    handle: handleGetWalletBalance
  },
  {
    name: "fundingOrders",
    method: "POST",
    path: DEFAULT_EASYAUTH_ENDPOINTS.fundingOrders,
    handle: (backend, input) =>
      handleCreateFundingOrder(backend, input as EasyAuthHandlerInput<FundingRequest>)
  },
  {
    name: "fundingStatus",
    method: "GET",
    path: DEFAULT_EASYAUTH_ENDPOINTS.fundingStatus,
    handle: (backend, input) => handleGetFundingStatus(backend, input)
  },
  {
    name: "fundingHistory",
    method: "GET",
    path: DEFAULT_EASYAUTH_ENDPOINTS.fundingHistory,
    handle: handleGetFundingHistory
  },
  {
    name: "crossmintWebhook",
    method: "POST",
    path: "/webhooks/crossmint",
    handle: handleWebhook
  }
] satisfies EasyAuthRouteContract[];

export function getEasyAuthBackendRoutes() {
  return EASYAUTH_BACKEND_ROUTES;
}

export function createEasyAuthRouteHandlers(backend: EasyAuthBackend) {
  return EASYAUTH_BACKEND_ROUTES.map((route) => ({
    ...route,
    handle: (input: EasyAuthHandlerInput = {}) => route.handle(backend, input)
  }));
}

export type EasyAuthRouteHandlers = ReturnType<typeof createEasyAuthRouteHandlers>;
