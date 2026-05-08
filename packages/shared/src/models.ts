export type EasyAuthChain = "solana";

export type EasyAuthEnvironment = "development" | "production";

export type EasyAuthNetwork = "devnet" | "mainnet";

export type WalletStatus = "creating" | "active" | "failed";

export type FundingPaymentStatus =
  | "pending"
  | "requires_kyc"
  | "requires_payment"
  | "paid"
  | "failed"
  | "cancelled";

export type FundingDeliveryStatus =
  | "not_started"
  | "pending"
  | "completed"
  | "failed";

export type FundingStatus =
  | "pending"
  | "requires_action"
  | "paid"
  | "funded"
  | "failed"
  | "cancelled";

export type FundingCheckoutMode = "embedded" | "hosted";

export interface EasyAuthUser {
  id: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

export interface EasyAuthSession {
  user: EasyAuthUser;
  expiresAt?: string;
}

export interface EasyAuthWallet {
  id: string;
  address: string;
  provider: string;
  chain: EasyAuthChain;
  network: EasyAuthNetwork;
  status: WalletStatus;
  userId?: string;
  providerWalletId?: string;
  providerOwnerId?: string;
  walletType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletTokenBalance {
  token: string;
  symbol: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

export interface WalletBalance {
  address: string;
  chain: EasyAuthChain;
  network: EasyAuthNetwork;
  /** SOL balance in lamports */
  lamports: number;
  /** SOL balance as a human-readable number */
  sol: number;
  tokens: WalletTokenBalance[];
  fetchedAt: string;
}

export interface FundingRequest {
  amount: number;
  currency?: string;
  asset?: string;
  walletId?: string;
  returnUrl?: string;
  checkoutMode?: FundingCheckoutMode;
}

export interface EasyAuthEmbeddedCheckout {
  provider: "crossmint";
  orderId: string;
  clientSecret: string;
  clientApiKey?: string;
  receiptEmail?: string;
}

export interface EasyAuthFundingOrder {
  id: string;
  provider: string;
  status: FundingStatus;
  paymentStatus: FundingPaymentStatus;
  deliveryStatus: FundingDeliveryStatus;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAsset: string;
  chain: EasyAuthChain;
  network: EasyAuthNetwork;
  walletId?: string;
  providerOrderId?: string;
  providerQuoteId?: string;
  checkoutMode?: FundingCheckoutMode;
  checkoutUrl?: string;
  embeddedCheckout?: EasyAuthEmbeddedCheckout;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FundingHistoryResult {
  transactions: EasyAuthFundingOrder[];
  total: number;
}
