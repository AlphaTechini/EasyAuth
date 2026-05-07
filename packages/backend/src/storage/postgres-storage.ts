import { Pool, type PoolConfig, type QueryResultRow } from "pg";
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
import { EASYAUTH_POSTGRES_SCHEMA_SQL } from "./postgres-schema.js";

export interface PostgresStorageAdapterConfig {
  connectionString?: string;
  pool?: PostgresPoolLike;
  poolConfig?: PoolConfig;
  runMigrations?: boolean;
}

export interface PostgresPoolLike {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: T[]; rowCount: number | null }>;
  end?(): Promise<void>;
}

interface WalletRow extends QueryResultRow {
  id: string;
  user_id: string;
  address: string;
  provider: string;
  provider_wallet_id: string | null;
  provider_owner_id: string;
  idempotency_key: string;
  chain: StoredEasyAuthWallet["chain"];
  network: StoredEasyAuthWallet["network"];
  wallet_type: string | null;
  status: StoredEasyAuthWallet["status"];
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

interface FundingRow extends QueryResultRow {
  id: string;
  user_id: string;
  wallet_id: string;
  provider: string;
  provider_order_id: string | null;
  provider_quote_id: string | null;
  checkout_mode: StoredFundingTransaction["checkoutMode"] | null;
  checkout_url: string | null;
  embedded_checkout: StoredFundingTransaction["embeddedCheckout"] | null;
  fiat_amount: string | number;
  fiat_currency: string;
  crypto_asset: string;
  chain: StoredFundingTransaction["chain"];
  network: StoredFundingTransaction["network"];
  payment_status: StoredFundingTransaction["paymentStatus"];
  delivery_status: StoredFundingTransaction["deliveryStatus"];
  status: StoredFundingTransaction["status"];
  failure_reason: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

interface WebhookRow extends QueryResultRow {
  provider: string;
  dedupe_key: string;
  event_type: string;
  payload: unknown;
  external_event_id: string | null;
  external_order_id: string | null;
  processed_at: Date | string | null;
  created_at: Date | string | null;
}

export class PostgresStorageAdapter implements StorageAdapter {
  private readonly pool: PostgresPoolLike;
  private readonly ownsPool: boolean;

  constructor(config: PostgresStorageAdapterConfig = {}) {
    if (config.pool) {
      this.pool = config.pool;
      this.ownsPool = false;
    } else {
      this.pool = new Pool({
        ...config.poolConfig,
        connectionString: config.connectionString ?? config.poolConfig?.connectionString
      });
      this.ownsPool = true;
    }
  }

  async migrate() {
    await this.pool.query(EASYAUTH_POSTGRES_SCHEMA_SQL);
  }

  async close() {
    if (this.ownsPool) {
      await this.pool.end?.();
    }
  }

  async getWalletByUserId(userId: string) {
    const result = await this.pool.query<WalletRow>(
      "SELECT * FROM easyauth_wallets WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    return result.rows[0] ? mapWalletRow(result.rows[0]) : null;
  }

  async saveWallet(wallet: StoredEasyAuthWallet) {
    const result = await this.pool.query<WalletRow>(
      `
        INSERT INTO easyauth_wallets (
          id, user_id, address, provider, provider_wallet_id, provider_owner_id,
          idempotency_key, chain, network, wallet_type, status, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          COALESCE($12::timestamptz, NOW()),
          COALESCE($13::timestamptz, NOW())
        )
        ON CONFLICT (user_id) DO UPDATE SET
          address = EXCLUDED.address,
          provider = EXCLUDED.provider,
          provider_wallet_id = EXCLUDED.provider_wallet_id,
          provider_owner_id = EXCLUDED.provider_owner_id,
          idempotency_key = EXCLUDED.idempotency_key,
          chain = EXCLUDED.chain,
          network = EXCLUDED.network,
          wallet_type = EXCLUDED.wallet_type,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *
      `,
      [
        wallet.id,
        wallet.userId,
        wallet.address,
        wallet.provider,
        wallet.providerWalletId ?? null,
        wallet.providerOwnerId,
        wallet.idempotencyKey,
        wallet.chain,
        wallet.network,
        wallet.walletType ?? null,
        wallet.status,
        wallet.createdAt ?? null,
        wallet.updatedAt ?? null
      ]
    );

    return mapRequiredWalletRow(result.rows[0]);
  }

  async createFundingTransaction(transaction: StoredFundingTransaction) {
    const result = await this.pool.query<FundingRow>(
      `
        INSERT INTO easyauth_funding_transactions (
          id, user_id, wallet_id, provider, provider_order_id, provider_quote_id,
          checkout_mode, checkout_url, embedded_checkout, fiat_amount, fiat_currency,
          crypto_asset, chain, network, payment_status, delivery_status, status,
          failure_reason, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12,
          $13, $14, $15, $16, $17, $18,
          COALESCE($19::timestamptz, NOW()),
          COALESCE($20::timestamptz, NOW())
        )
        RETURNING *
      `,
      [
        transaction.id,
        transaction.userId,
        transaction.walletId,
        transaction.provider,
        transaction.providerOrderId ?? null,
        transaction.providerQuoteId ?? null,
        transaction.checkoutMode ?? null,
        transaction.checkoutUrl ?? null,
        toJsonParameter(transaction.embeddedCheckout),
        transaction.fiatAmount,
        transaction.fiatCurrency,
        transaction.cryptoAsset,
        transaction.chain,
        transaction.network,
        transaction.paymentStatus,
        transaction.deliveryStatus,
        transaction.status,
        transaction.failureReason ?? null,
        transaction.createdAt ?? null,
        transaction.updatedAt ?? null
      ]
    );

    return mapRequiredFundingRow(result.rows[0]);
  }

  async updateFundingTransaction(
    id: string,
    updates: Partial<StoredFundingTransaction>
  ) {
    const existing = await this.getFundingTransaction(id);

    if (!existing) {
      throw new Error(`Funding transaction ${id} was not found.`);
    }

    const nextTransaction = {
      ...existing,
      ...updates,
      updatedAt: updates.updatedAt ?? new Date().toISOString()
    };
    const result = await this.pool.query<FundingRow>(
      `
        UPDATE easyauth_funding_transactions SET
          provider_order_id = $2,
          provider_quote_id = $3,
          checkout_mode = $4,
          checkout_url = $5,
          embedded_checkout = $6::jsonb,
          payment_status = $7,
          delivery_status = $8,
          status = $9,
          failure_reason = $10,
          updated_at = $11::timestamptz
        WHERE id = $1
        RETURNING *
      `,
      [
        nextTransaction.id,
        nextTransaction.providerOrderId ?? null,
        nextTransaction.providerQuoteId ?? null,
        nextTransaction.checkoutMode ?? null,
        nextTransaction.checkoutUrl ?? null,
        toJsonParameter(nextTransaction.embeddedCheckout),
        nextTransaction.paymentStatus,
        nextTransaction.deliveryStatus,
        nextTransaction.status,
        nextTransaction.failureReason ?? null,
        nextTransaction.updatedAt
      ]
    );

    return mapRequiredFundingRow(result.rows[0]);
  }

  async getFundingTransaction(id: string) {
    const result = await this.pool.query<FundingRow>(
      "SELECT * FROM easyauth_funding_transactions WHERE id = $1 LIMIT 1",
      [id]
    );

    return result.rows[0] ? mapFundingRow(result.rows[0]) : null;
  }

  async getFundingTransactionByProviderOrderId(providerOrderId: string) {
    const result = await this.pool.query<FundingRow>(
      "SELECT * FROM easyauth_funding_transactions WHERE provider_order_id = $1 LIMIT 1",
      [providerOrderId]
    );

    return result.rows[0] ? mapFundingRow(result.rows[0]) : null;
  }

  async recordWebhookEvent(
    input: RecordWebhookEventInput
  ): Promise<RecordWebhookEventResult> {
    const insertResult = await this.pool.query<WebhookRow>(
      `
        INSERT INTO easyauth_webhook_events (
          provider, dedupe_key, event_type, payload, external_event_id, external_order_id
        )
        VALUES ($1, $2, $3, $4::jsonb, $5, $6)
        ON CONFLICT (provider, dedupe_key) DO NOTHING
        RETURNING *
      `,
      [
        input.provider,
        input.dedupeKey,
        input.eventType,
        JSON.stringify(input.payload),
        input.externalEventId ?? null,
        input.externalOrderId ?? null
      ]
    );

    if (insertResult.rows[0]) {
      return {
        recorded: true,
        event: mapWebhookRow(insertResult.rows[0])
      };
    }

    const existingResult = await this.pool.query<WebhookRow>(
      `
        SELECT *
        FROM easyauth_webhook_events
        WHERE provider = $1 AND dedupe_key = $2
        LIMIT 1
      `,
      [input.provider, input.dedupeKey]
    );

    return {
      recorded: false,
      event: mapRequiredWebhookRow(existingResult.rows[0])
    };
  }

  async markWebhookEventProcessed(provider: string, dedupeKey: string) {
    const result = await this.pool.query<WebhookRow>(
      `
        UPDATE easyauth_webhook_events
        SET processed_at = NOW()
        WHERE provider = $1 AND dedupe_key = $2
        RETURNING *
      `,
      [provider, dedupeKey]
    );

    return mapRequiredWebhookRow(result.rows[0]);
  }
}

export async function createPostgresStorageAdapter(
  config: PostgresStorageAdapterConfig
) {
  const adapter = new PostgresStorageAdapter(config);

  if (config.runMigrations) {
    await adapter.migrate();
  }

  return adapter;
}

function mapWalletRow(row: WalletRow): StoredEasyAuthWallet {
  return {
    id: row.id,
    userId: row.user_id,
    address: row.address,
    provider: row.provider,
    providerWalletId: row.provider_wallet_id ?? undefined,
    providerOwnerId: row.provider_owner_id,
    idempotencyKey: row.idempotency_key,
    chain: row.chain,
    network: row.network,
    walletType: row.wallet_type ?? undefined,
    status: row.status,
    createdAt: mapTimestamp(row.created_at),
    updatedAt: mapTimestamp(row.updated_at)
  };
}

function mapFundingRow(row: FundingRow): StoredFundingTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    walletId: row.wallet_id,
    provider: row.provider,
    providerOrderId: row.provider_order_id ?? undefined,
    providerQuoteId: row.provider_quote_id ?? undefined,
    checkoutMode: row.checkout_mode ?? undefined,
    checkoutUrl: row.checkout_url ?? undefined,
    embeddedCheckout: row.embedded_checkout ?? undefined,
    fiatAmount: Number(row.fiat_amount),
    fiatCurrency: row.fiat_currency,
    cryptoAsset: row.crypto_asset,
    chain: row.chain,
    network: row.network,
    paymentStatus: row.payment_status,
    deliveryStatus: row.delivery_status,
    status: row.status,
    failureReason: row.failure_reason ?? undefined,
    createdAt: mapTimestamp(row.created_at),
    updatedAt: mapTimestamp(row.updated_at)
  };
}

function mapWebhookRow(row: WebhookRow): StoredWebhookEvent {
  return {
    provider: row.provider,
    dedupeKey: row.dedupe_key,
    eventType: row.event_type,
    payload: row.payload,
    externalEventId: row.external_event_id ?? undefined,
    externalOrderId: row.external_order_id ?? undefined,
    processedAt: mapTimestamp(row.processed_at),
    createdAt: mapTimestamp(row.created_at) ?? new Date().toISOString()
  };
}

function mapRequiredWalletRow(row: WalletRow | undefined) {
  if (!row) {
    throw new Error("Postgres did not return the saved wallet.");
  }

  return mapWalletRow(row);
}

function mapRequiredFundingRow(row: FundingRow | undefined) {
  if (!row) {
    throw new Error("Postgres did not return the funding transaction.");
  }

  return mapFundingRow(row);
}

function mapRequiredWebhookRow(row: WebhookRow | undefined) {
  if (!row) {
    throw new Error("Postgres did not return the webhook event.");
  }

  return mapWebhookRow(row);
}

function mapTimestamp(value: Date | string | null) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ?? undefined;
}

function toJsonParameter(value: unknown) {
  return value === undefined ? null : JSON.stringify(value);
}
