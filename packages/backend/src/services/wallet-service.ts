import type { EasyAuthChain, EasyAuthNetwork } from "@easyauth/shared";
import type { EasyAuthBackendConfig } from "../config.js";
import { unauthorized } from "../errors.js";
import type {
  CreateWalletServiceInput,
  EasyAuthSessionRequest,
  StoredEasyAuthWallet
} from "../types.js";
import { normalizeCreateWalletInput } from "../validation.js";
import type { createSessionService } from "./session-service.js";

const DEFAULT_CHAIN: EasyAuthChain = "solana";
const DEFAULT_NETWORK: EasyAuthNetwork = "devnet";

export function createWalletService(
  config: Pick<EasyAuthBackendConfig, "wallet" | "storage">,
  sessionService: ReturnType<typeof createSessionService>
) {
  return {
    async getWallet(input: EasyAuthSessionRequest = {}) {
      const session = await sessionService.getSession(input);

      if (!session) {
        return null;
      }

      return config.storage.getWalletByUserId(session.user.id);
    },
    async createWallet(input: EasyAuthSessionRequest & CreateWalletServiceInput = {}) {
      const session = await sessionService.getSession(input);

      if (!session) {
        throw unauthorized();
      }

      const walletInput = normalizeCreateWalletInput(input);
      const existingWallet = await config.storage.getWalletByUserId(session.user.id);

      if (existingWallet) {
        return existingWallet;
      }

      const chain = DEFAULT_CHAIN;
      const network = walletInput.network ?? DEFAULT_NETWORK;
      const idempotencyKey = createWalletIdempotencyKey(session.user.id, chain, network);
      const providerWallet = await config.wallet.createOrRetrieveWallet({
        user: session.user,
        chain,
        network,
        idempotencyKey
      });
      const now = new Date().toISOString();
      const wallet: StoredEasyAuthWallet = {
        id: createId("wallet"),
        userId: session.user.id,
        address: providerWallet.address,
        provider: providerWallet.provider,
        providerOwnerId: providerWallet.providerOwnerId,
        providerWalletId: providerWallet.providerWalletId,
        idempotencyKey,
        chain,
        network,
        walletType: providerWallet.walletType,
        status: providerWallet.status ?? "active",
        createdAt: now,
        updatedAt: now
      };

      return config.storage.saveWallet(wallet);
    }
  };
}

function createWalletIdempotencyKey(
  userId: string,
  chain: EasyAuthChain,
  network: EasyAuthNetwork
) {
  return `wallet:${chain}:${network}:${userId}`;
}

export function createId(prefix: string) {
  return `${prefix}_${globalThis.crypto.randomUUID()}`;
}
