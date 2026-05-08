import type {
  EasyAuthApiEndpoints,
  EasyAuthFundingOrder,
  EasyAuthSession,
  EasyAuthWallet,
  FundingCheckoutMode,
  FundingHistoryResult,
  FundingRequest,
  WalletBalance
} from "@easyauth/shared";
import type { EasyAuthApiClient, EasyAuthFetch } from "./api-client.js";
import type { EasyAuthEventHandler, EasyAuthEventName } from "./events.js";
import type { EasyAuthThemeConfig } from "./theme.js";

export interface EasyAuthConfig {
  apiBaseUrl?: string;
  endpoints?: Partial<EasyAuthApiEndpoints>;
  fetch?: EasyAuthFetch;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  theme?: EasyAuthThemeConfig;
}

export interface LoginOptions {
  returnTo?: string;
  provider?: "google" | string;
  errorCallbackURL?: string;
  newUserCallbackURL?: string;
}

export interface FundWalletOptions extends FundingRequest {
  openCheckout?: boolean;
  checkoutMode?: FundingCheckoutMode;
}

export type EasyAuthClientStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "wallet_ready"
  | "funding_pending"
  | "funded"
  | "error";

export interface EasyAuthClientSnapshot {
  status: EasyAuthClientStatus;
  session: EasyAuthSession | null;
  wallet: EasyAuthWallet | null;
  fundingOrder: EasyAuthFundingOrder | null;
  error: unknown;
}

export interface EasyAuthFrontendClient {
  api: EasyAuthApiClient;
  theme: EasyAuthThemeConfig;
  login(options?: LoginOptions): Promise<void>;
  getSession(): Promise<EasyAuthSession | null>;
  getWallet(): Promise<EasyAuthWallet | null>;
  createWallet(): Promise<EasyAuthWallet>;
  getWalletBalance(): Promise<WalletBalance>;
  fundWallet(options: FundWalletOptions): Promise<EasyAuthFundingOrder>;
  getFundingStatus(fundingId: string): Promise<EasyAuthFundingOrder>;
  getFundingHistory(options?: { limit?: number; offset?: number }): Promise<FundingHistoryResult>;
  on<TEventName extends EasyAuthEventName>(
    eventName: TEventName,
    handler: EasyAuthEventHandler<TEventName>
  ): () => void;
}
