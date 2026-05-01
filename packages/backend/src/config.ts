import type { AuthAdapter } from "./adapters/auth.js";
import type { FundingAdapter } from "./adapters/funding.js";
import type { StorageAdapter } from "./adapters/storage.js";
import type { WalletAdapter } from "./adapters/wallet.js";
import { createFundingService } from "./services/funding-service.js";
import { createSessionService } from "./services/session-service.js";
import { createWalletService } from "./services/wallet-service.js";
import { createWebhookService } from "./services/webhook-service.js";
import type { EasyAuthServices } from "./types.js";

export interface EasyAuthBackendConfig {
  auth: AuthAdapter;
  wallet: WalletAdapter;
  funding: FundingAdapter;
  storage: StorageAdapter;
  security?: EasyAuthBackendSecurityOptions;
}

export interface EasyAuthBackendSecurityOptions {
  requireWebhookRawBody?: boolean;
}

export interface EasyAuthBackend {
  services: EasyAuthServices;
}

export function createEasyAuthBackend(config: EasyAuthBackendConfig): EasyAuthBackend {
  const sessionService = createSessionService(config);
  const walletService = createWalletService(config, sessionService);
  const fundingService = createFundingService(config, sessionService);
  const webhookService = createWebhookService(config);

  return {
    services: {
      getSession: sessionService.getSession,
      getWallet: walletService.getWallet,
      createWallet: walletService.createWallet,
      createFundingOrder: fundingService.createFundingOrder,
      getFundingStatus: fundingService.getFundingStatus,
      processWebhook: webhookService.processWebhook
    }
  };
}
