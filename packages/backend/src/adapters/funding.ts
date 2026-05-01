import type {
  EasyAuthChain,
  EasyAuthEmbeddedCheckout,
  EasyAuthNetwork,
  FundingCheckoutMode,
  FundingDeliveryStatus,
  FundingPaymentStatus,
  FundingStatus
} from "@easyauth/shared";
import type { EasyAuthUser } from "@easyauth/shared";
import type {
  EasyAuthRequestHeaders,
  StoredEasyAuthWallet,
  StoredFundingTransaction
} from "../types.js";

export interface CreateProviderFundingOrderInput {
  user: EasyAuthUser;
  userId: string;
  wallet: StoredEasyAuthWallet;
  amount: number;
  currency: string;
  asset: string;
  chain: EasyAuthChain;
  network: EasyAuthNetwork;
  returnUrl?: string;
  checkoutMode?: FundingCheckoutMode;
}

export interface ProviderFundingOrderResult {
  provider: string;
  providerOrderId?: string;
  providerQuoteId?: string;
  checkoutMode?: FundingCheckoutMode;
  checkoutUrl?: string;
  embeddedCheckout?: EasyAuthEmbeddedCheckout;
  paymentStatus?: FundingPaymentStatus;
  deliveryStatus?: FundingDeliveryStatus;
  status?: FundingStatus;
  failureReason?: string;
}

export interface FundingWebhookUpdate {
  transactionId?: string;
  providerOrderId?: string;
  paymentStatus?: FundingPaymentStatus;
  deliveryStatus?: FundingDeliveryStatus;
  status?: FundingStatus;
  failureReason?: string;
}

export interface VerifiedFundingWebhook {
  provider: string;
  dedupeKey: string;
  eventType: string;
  payload: unknown;
  externalEventId?: string;
  externalOrderId?: string;
  funding?: FundingWebhookUpdate;
}

export interface VerifyFundingWebhookInput {
  headers?: EasyAuthRequestHeaders;
  body: unknown;
  rawBody?: string | Uint8Array;
}

export interface FundingAdapter {
  createFundingOrder(
    input: CreateProviderFundingOrderInput
  ): Promise<ProviderFundingOrderResult>;
  verifyWebhook(input: VerifyFundingWebhookInput): Promise<VerifiedFundingWebhook>;
  mapStatus?(transaction: StoredFundingTransaction): FundingStatus;
}
