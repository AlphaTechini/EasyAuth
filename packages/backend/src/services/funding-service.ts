import type { EasyAuthChain, EasyAuthNetwork, FundingStatus } from "@easyauth/shared";
import type { EasyAuthBackendConfig } from "../config.js";
import { notFound, unauthorized, validationError } from "../errors.js";
import type {
  CreateFundingServiceInput,
  EasyAuthSessionRequest,
  StoredFundingTransaction
} from "../types.js";
import { normalizeFundingInput } from "../validation.js";
import { createId } from "./wallet-service.js";
import type { createSessionService } from "./session-service.js";

const DEFAULT_CHAIN: EasyAuthChain = "solana";
const DEFAULT_NETWORK: EasyAuthNetwork = "devnet";

export function createFundingService(
  config: Pick<EasyAuthBackendConfig, "funding" | "storage">,
  sessionService: ReturnType<typeof createSessionService>
) {
  return {
    async createFundingOrder(input: EasyAuthSessionRequest & CreateFundingServiceInput) {
      const session = await sessionService.getSession(input);

      if (!session) {
        throw unauthorized();
      }

      const fundingInput = normalizeFundingInput(input);
      const wallet = await config.storage.getWalletByUserId(session.user.id);

      if (!wallet) {
        throw notFound("Create a wallet before starting a funding order.");
      }

      if (fundingInput.walletId && fundingInput.walletId !== wallet.id) {
        throw validationError("Funding walletId must match the authenticated user's wallet.", {
          field: "walletId"
        });
      }

      if (wallet.status !== "active") {
        throw validationError("Wallet must be active before it can be funded.", {
          walletStatus: wallet.status
        });
      }

      const providerOrder = await config.funding.createFundingOrder({
        user: session.user,
        userId: session.user.id,
        wallet,
        amount: fundingInput.amount,
        currency: fundingInput.currency,
        asset: fundingInput.asset,
        chain: DEFAULT_CHAIN,
        network: wallet.network ?? DEFAULT_NETWORK,
        returnUrl: fundingInput.returnUrl,
        checkoutMode: fundingInput.checkoutMode
      });
      const now = new Date().toISOString();
      const transaction: StoredFundingTransaction = {
        id: createId("funding"),
        userId: session.user.id,
        walletId: wallet.id,
        provider: providerOrder.provider,
        providerOrderId: providerOrder.providerOrderId,
        providerQuoteId: providerOrder.providerQuoteId,
        checkoutMode: providerOrder.checkoutMode,
        checkoutUrl: providerOrder.checkoutUrl,
        embeddedCheckout: providerOrder.embeddedCheckout,
        fiatAmount: fundingInput.amount,
        fiatCurrency: fundingInput.currency,
        cryptoAsset: fundingInput.asset,
        chain: DEFAULT_CHAIN,
        network: wallet.network ?? DEFAULT_NETWORK,
        paymentStatus: providerOrder.paymentStatus ?? "pending",
        deliveryStatus: providerOrder.deliveryStatus ?? "not_started",
        status:
          providerOrder.status ??
          deriveFundingStatus(
            providerOrder.paymentStatus ?? "pending",
            providerOrder.deliveryStatus ?? "not_started"
          ),
        failureReason: providerOrder.failureReason,
        createdAt: now,
        updatedAt: now
      };

      return config.storage.createFundingTransaction(transaction);
    },
    async getFundingStatus(input: EasyAuthSessionRequest & { fundingId: string }) {
      const session = await sessionService.getSession(input);

      if (!session) {
        throw unauthorized();
      }

      const transaction = await config.storage.getFundingTransaction(input.fundingId);

      if (!transaction || transaction.userId !== session.user.id) {
        throw notFound("Funding order was not found.");
      }

      return transaction;
    }
  };
}

export function deriveFundingStatus(
  paymentStatus: StoredFundingTransaction["paymentStatus"],
  deliveryStatus: StoredFundingTransaction["deliveryStatus"]
): FundingStatus {
  if (paymentStatus === "failed" || deliveryStatus === "failed") {
    return "failed";
  }

  if (paymentStatus === "cancelled") {
    return "cancelled";
  }

  if (deliveryStatus === "completed") {
    return "funded";
  }

  if (paymentStatus === "requires_kyc" || paymentStatus === "requires_payment") {
    return "requires_action";
  }

  if (paymentStatus === "paid") {
    return "paid";
  }

  return "pending";
}
