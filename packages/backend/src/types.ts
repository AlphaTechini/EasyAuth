import type {
  EasyAuthFundingOrder,
  EasyAuthNetwork,
  EasyAuthSession,
  EasyAuthWallet,
  FundingRequest
} from "@easyauth/shared";

export type EasyAuthRequestHeaders = Record<string, string | string[] | undefined>;

export interface EasyAuthHandlerInput<
  TBody = unknown,
  TParams extends Record<string, string | undefined> = Record<string, string | undefined>
> {
  headers?: EasyAuthRequestHeaders;
  cookies?: string;
  body?: TBody;
  params?: TParams;
  rawBody?: string | Uint8Array;
  rawRequest?: unknown;
}

export interface EasyAuthHandlerResponse<TBody = unknown> {
  status: number;
  body: TBody;
  headers?: Record<string, string>;
}

export interface EasyAuthSessionRequest {
  headers?: EasyAuthRequestHeaders;
  cookies?: string;
  rawRequest?: unknown;
}

export interface StoredEasyAuthWallet extends EasyAuthWallet {
  userId: string;
  idempotencyKey: string;
}

export interface StoredFundingTransaction extends EasyAuthFundingOrder {
  userId: string;
  walletId: string;
}

export interface StoredWebhookEvent {
  provider: string;
  dedupeKey: string;
  eventType: string;
  payload: unknown;
  externalEventId?: string;
  externalOrderId?: string;
  processedAt?: string;
  createdAt: string;
}

export interface CreateWalletServiceInput {
  network?: EasyAuthNetwork;
}

export interface CreateFundingServiceInput extends FundingRequest {}

export interface WebhookServiceInput {
  headers?: EasyAuthRequestHeaders;
  body: unknown;
  rawBody?: string | Uint8Array;
}

export interface WebhookProcessResult {
  recorded: boolean;
  processed: boolean;
  fundingOrder?: StoredFundingTransaction;
}

export interface EasyAuthServices {
  getSession(input?: EasyAuthSessionRequest): Promise<EasyAuthSession | null>;
  getWallet(input?: EasyAuthSessionRequest): Promise<StoredEasyAuthWallet | null>;
  createWallet(
    input?: EasyAuthSessionRequest & CreateWalletServiceInput
  ): Promise<StoredEasyAuthWallet>;
  createFundingOrder(
    input: EasyAuthSessionRequest & CreateFundingServiceInput
  ): Promise<StoredFundingTransaction>;
  getFundingStatus(
    input: EasyAuthSessionRequest & { fundingId: string }
  ): Promise<StoredFundingTransaction>;
  processWebhook(input: WebhookServiceInput): Promise<WebhookProcessResult>;
}
