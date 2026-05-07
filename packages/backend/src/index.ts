import { EASYAUTH_SHARED_PACKAGE } from "@easyauth/shared";

export const EASYAUTH_BACKEND_PACKAGE = "@easyauth/backend";

export function getBackendPackageInfo() {
  return {
    name: EASYAUTH_BACKEND_PACKAGE,
    sharedPackage: EASYAUTH_SHARED_PACKAGE
  };
}

export * from "./adapters/auth.js";
export * from "./adapters/better-auth.js";
export * from "./adapters/crossmint-funding.js";
export * from "./adapters/crossmint-http.js";
export * from "./adapters/crossmint-wallet.js";
export * from "./adapters/funding.js";
export * from "./adapters/storage.js";
export * from "./adapters/wallet.js";
export * from "./config.js";
export * from "./errors.js";
export * from "./handlers/index.js";
export * from "./integrations/fastify.js";
export * from "./services/funding-service.js";
export * from "./services/session-service.js";
export * from "./services/wallet-service.js";
export * from "./services/webhook-service.js";
export * from "./storage/memory-storage.js";
export * from "./storage/postgres-schema.js";
export * from "./storage/postgres-storage.js";
export * from "./types.js";
