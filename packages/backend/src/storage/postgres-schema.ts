export const EASYAUTH_POSTGRES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS easyauth_wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  provider_wallet_id TEXT,
  provider_owner_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL,
  network TEXT NOT NULL,
  wallet_type TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT easyauth_wallets_one_wallet_per_user UNIQUE (user_id),
  CONSTRAINT easyauth_wallets_status_check CHECK (status IN ('creating', 'active', 'failed'))
);

CREATE TABLE IF NOT EXISTS easyauth_funding_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_id TEXT NOT NULL REFERENCES easyauth_wallets(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_order_id TEXT UNIQUE,
  provider_quote_id TEXT,
  checkout_mode TEXT,
  checkout_url TEXT,
  embedded_checkout JSONB,
  fiat_amount NUMERIC(18, 6) NOT NULL,
  fiat_currency TEXT NOT NULL,
  crypto_asset TEXT NOT NULL,
  chain TEXT NOT NULL,
  network TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  status TEXT NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT easyauth_funding_checkout_mode_check CHECK (
    checkout_mode IS NULL OR checkout_mode IN ('embedded', 'hosted')
  ),
  CONSTRAINT easyauth_funding_payment_status_check CHECK (
    payment_status IN ('pending', 'requires_kyc', 'requires_payment', 'paid', 'failed', 'cancelled')
  ),
  CONSTRAINT easyauth_funding_delivery_status_check CHECK (
    delivery_status IN ('not_started', 'pending', 'completed', 'failed')
  ),
  CONSTRAINT easyauth_funding_status_check CHECK (
    status IN ('pending', 'requires_action', 'paid', 'funded', 'failed', 'cancelled')
  )
);

CREATE TABLE IF NOT EXISTS easyauth_webhook_events (
  provider TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  external_event_id TEXT,
  external_order_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT easyauth_webhook_events_provider_dedupe_key PRIMARY KEY (provider, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_easyauth_wallets_user_id
  ON easyauth_wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_easyauth_wallets_provider_owner_id
  ON easyauth_wallets(provider_owner_id);

CREATE INDEX IF NOT EXISTS idx_easyauth_funding_transactions_user_id
  ON easyauth_funding_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_easyauth_funding_transactions_wallet_id
  ON easyauth_funding_transactions(wallet_id);

CREATE INDEX IF NOT EXISTS idx_easyauth_funding_transactions_provider_order_id
  ON easyauth_funding_transactions(provider_order_id);

CREATE INDEX IF NOT EXISTS idx_easyauth_webhook_events_external_order_id
  ON easyauth_webhook_events(external_order_id);
`.trim();

export function getEasyAuthPostgresSchemaSql() {
  return EASYAUTH_POSTGRES_SCHEMA_SQL;
}
