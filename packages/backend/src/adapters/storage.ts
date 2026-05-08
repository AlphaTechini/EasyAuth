import type {
  StoredEasyAuthWallet,
  StoredFundingTransaction,
  StoredWebhookEvent
} from "../types.js";

export interface RecordWebhookEventInput {
  provider: string;
  dedupeKey: string;
  eventType: string;
  payload: unknown;
  externalEventId?: string;
  externalOrderId?: string;
}

export interface RecordWebhookEventResult {
  recorded: boolean;
  event: StoredWebhookEvent;
}

export interface GetFundingHistoryOptions {
  limit?: number;
  offset?: number;
}

export interface StorageAdapter {
  getWalletByUserId(userId: string): Promise<StoredEasyAuthWallet | null>;
  saveWallet(wallet: StoredEasyAuthWallet): Promise<StoredEasyAuthWallet>;
  createFundingTransaction(
    transaction: StoredFundingTransaction
  ): Promise<StoredFundingTransaction>;
  updateFundingTransaction(
    id: string,
    updates: Partial<StoredFundingTransaction>
  ): Promise<StoredFundingTransaction>;
  getFundingTransaction(id: string): Promise<StoredFundingTransaction | null>;
  getFundingTransactionByProviderOrderId(
    providerOrderId: string
  ): Promise<StoredFundingTransaction | null>;
  getFundingHistoryByUserId(
    userId: string,
    options?: GetFundingHistoryOptions
  ): Promise<{ transactions: StoredFundingTransaction[]; total: number }>;
  recordWebhookEvent(input: RecordWebhookEventInput): Promise<RecordWebhookEventResult>;
  markWebhookEventProcessed(provider: string, dedupeKey: string): Promise<StoredWebhookEvent>;
}
