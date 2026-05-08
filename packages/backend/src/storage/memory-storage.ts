import type {
  RecordWebhookEventInput,
  RecordWebhookEventResult,
  StorageAdapter
} from "../adapters/storage.js";
import type {
  StoredEasyAuthWallet,
  StoredFundingTransaction,
  StoredWebhookEvent
} from "../types.js";

export class MemoryStorageAdapter implements StorageAdapter {
  private readonly walletsByUserId = new Map<string, StoredEasyAuthWallet>();
  private readonly fundingById = new Map<string, StoredFundingTransaction>();
  private readonly fundingIdByProviderOrderId = new Map<string, string>();
  private readonly webhookEvents = new Map<string, StoredWebhookEvent>();

  async getWalletByUserId(userId: string) {
    return this.walletsByUserId.get(userId) ?? null;
  }

  async saveWallet(wallet: StoredEasyAuthWallet) {
    const savedWallet = {
      ...wallet,
      updatedAt: wallet.updatedAt ?? new Date().toISOString()
    };
    this.walletsByUserId.set(savedWallet.userId, savedWallet);
    return savedWallet;
  }

  async createFundingTransaction(transaction: StoredFundingTransaction) {
    this.fundingById.set(transaction.id, transaction);

    if (transaction.providerOrderId) {
      this.fundingIdByProviderOrderId.set(transaction.providerOrderId, transaction.id);
    }

    return transaction;
  }

  async updateFundingTransaction(
    id: string,
    updates: Partial<StoredFundingTransaction>
  ) {
    const existingTransaction = this.fundingById.get(id);

    if (!existingTransaction) {
      throw new Error(`Funding transaction ${id} was not found.`);
    }

    const updatedTransaction = {
      ...existingTransaction,
      ...updates,
      updatedAt: updates.updatedAt ?? new Date().toISOString()
    };

    this.fundingById.set(id, updatedTransaction);

    if (updatedTransaction.providerOrderId) {
      this.fundingIdByProviderOrderId.set(updatedTransaction.providerOrderId, id);
    }

    return updatedTransaction;
  }

  async getFundingTransaction(id: string) {
    return this.fundingById.get(id) ?? null;
  }

  async getFundingTransactionByProviderOrderId(providerOrderId: string) {
    const fundingId = this.fundingIdByProviderOrderId.get(providerOrderId);

    if (!fundingId) {
      return null;
    }

    return this.getFundingTransaction(fundingId);
  }

  async getFundingHistoryByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const all = [...this.fundingById.values()]
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => {
        // Most recent first
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

    const total = all.length;
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;
    const transactions = all.slice(offset, offset + limit);

    return { transactions, total };
  }

  async recordWebhookEvent(
    input: RecordWebhookEventInput
  ): Promise<RecordWebhookEventResult> {
    const eventKey = createWebhookEventKey(input.provider, input.dedupeKey);
    const existingEvent = this.webhookEvents.get(eventKey);

    if (existingEvent) {
      return {
        recorded: false,
        event: existingEvent
      };
    }

    const event: StoredWebhookEvent = {
      ...input,
      createdAt: new Date().toISOString()
    };
    this.webhookEvents.set(eventKey, event);

    return {
      recorded: true,
      event
    };
  }

  async markWebhookEventProcessed(provider: string, dedupeKey: string) {
    const eventKey = createWebhookEventKey(provider, dedupeKey);
    const event = this.webhookEvents.get(eventKey);

    if (!event) {
      throw new Error(`Webhook event ${eventKey} was not found.`);
    }

    const processedEvent = {
      ...event,
      processedAt: new Date().toISOString()
    };
    this.webhookEvents.set(eventKey, processedEvent);

    return processedEvent;
  }
}

export function createMemoryStorageAdapter() {
  return new MemoryStorageAdapter();
}

function createWebhookEventKey(provider: string, dedupeKey: string) {
  return `${provider}:${dedupeKey}`;
}
