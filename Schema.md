# EasyAuth Database Schema (v1)

## Overview

EasyAuth uses the database for three responsibilities:

- Better Auth stores app identity, OAuth accounts, verification data, and sessions.
- EasyAuth stores the Solana wallet mapped to each authenticated user.
- EasyAuth tracks Crossmint funding attempts and webhook processing.

The schema intentionally avoids private key storage. Wallet custody, signing, recovery, and on-ramp payment handling stay with the wallet and funding providers.

## Architectural Decision

Better Auth should own the auth tables instead of EasyAuth hand-rolling user/session storage. This keeps OAuth, cookie sessions, account linking, token refresh behavior, and future email/password support aligned with the auth framework.

Tradeoff:

- Benefit: less custom security-sensitive code and fewer session edge cases.
- Cost: EasyAuth must follow Better Auth's generated schema and migration flow.

Crossmint should own embedded wallet custody and on-ramp checkout. EasyAuth stores provider references, wallet address, lifecycle status, and funding status.

Tradeoff:

- Benefit: no custom key custody and faster hackathon delivery.
- Cost: wallet and funding behavior depend on Crossmint API availability and product constraints.

## Better Auth Managed Tables

These tables should be generated or migrated through Better Auth rather than manually invented. The exact SQL can be generated with Better Auth's CLI for the selected adapter.

### user

Stores the authenticated application user.

Expected fields from Better Auth:

```sql
"user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  emailVerified BOOLEAN NOT NULL,
  image TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

Notes:

- Use Better Auth's configured table and field names in implementation.
- If plural table names are preferred, configure Better Auth model names instead of creating incompatible tables.
- Do not store OAuth provider IDs directly on the user row.

### session

Stores active login sessions.

Expected fields from Better Auth:

```sql
session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

Notes:

- Better Auth manages cookie-backed session validation.
- EasyAuth routes should use Better Auth session helpers instead of reading raw tokens directly.

### account

Stores OAuth account links such as Google.

Expected fields from Better Auth:

```sql
account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope TEXT,
  idToken TEXT,
  password TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

Notes:

- Google identity belongs here, not in EasyAuth-owned wallet tables.
- Access and refresh tokens are sensitive and must never be logged.

### verification

Stores short-lived verification records used by Better Auth features.

Expected fields from Better Auth:

```sql
verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## EasyAuth Owned Tables

The following tables are owned by the EasyAuth application.

### easyauth_wallets

Stores one embedded Solana wallet per v1 user.

```sql
easyauth_wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'crossmint',
  provider_wallet_id TEXT,
  provider_owner_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL DEFAULT 'solana',
  network TEXT NOT NULL DEFAULT 'devnet',
  wallet_type TEXT,
  status TEXT NOT NULL DEFAULT 'creating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT easyauth_wallets_one_wallet_per_user UNIQUE (user_id),
  CONSTRAINT easyauth_wallets_status_check CHECK (status IN ('creating', 'active', 'failed'))
);
```

Design notes:

- `user_id` maps the Better Auth user to exactly one v1 wallet.
- The SDK uses text IDs such as `wallet_{uuid}` rather than database-generated UUID IDs so storage adapters can round-trip SDK objects without translation.
- `provider_owner_id` should be the stable Crossmint owner identifier derived from the authenticated user, not from a raw Google subject used as wallet key material.
- `idempotency_key` protects against duplicate wallet creation retries.
- `network` should be `devnet` for a hackathon demo unless production credentials and mainnet funding are intentionally configured.
- `wallet_type` is nullable because provider terminology can vary between smart wallets and MPC wallets.

To find wallet ownership logic visit [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The Crossmint wallet connection can be found in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).

### easyauth_funding_transactions

Tracks each fiat-to-wallet funding attempt.

```sql
easyauth_funding_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_id TEXT NOT NULL REFERENCES easyauth_wallets(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'crossmint',
  provider_order_id TEXT UNIQUE,
  provider_quote_id TEXT,
  checkout_mode TEXT,
  fiat_amount NUMERIC(12, 2) NOT NULL,
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  crypto_asset TEXT NOT NULL DEFAULT 'USDC',
  chain TEXT NOT NULL DEFAULT 'solana',
  network TEXT NOT NULL DEFAULT 'devnet',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  delivery_status TEXT NOT NULL DEFAULT 'not_started',
  status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  checkout_url TEXT,
  embedded_checkout JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT funding_payment_status_check CHECK (
    payment_status IN ('pending', 'requires_kyc', 'requires_payment', 'paid', 'failed', 'cancelled')
  ),
  CONSTRAINT funding_delivery_status_check CHECK (
    delivery_status IN ('not_started', 'pending', 'completed', 'failed')
  ),
  CONSTRAINT funding_status_check CHECK (
    status IN ('pending', 'requires_action', 'paid', 'funded', 'failed', 'cancelled')
  )
);
```

Design notes:

- The UI should show pending, paid, delivered, failed, and cancelled states instead of only opening checkout and hoping it worked.
- `provider_order_id` is nullable at insert time so a failed order-creation attempt can still be recorded if useful.
- `checkout_url` is optional because embedded checkout can use an order ID and client secret instead of a direct URL.
- `embedded_checkout` stores the non-secret checkout metadata needed by the browser-side embedded checkout component.
- `failure_reason` should store provider-safe failure context, not secrets or full raw payloads.

To find funding status logic visit [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The Crossmint on-ramp connection can be found in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).

### easyauth_webhook_events

Stores provider webhook events for idempotent processing and debugging.

```sql
easyauth_webhook_events (
  provider TEXT NOT NULL DEFAULT 'crossmint',
  dedupe_key TEXT NOT NULL,
  external_event_id TEXT,
  external_order_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT easyauth_webhook_events_provider_dedupe_key PRIMARY KEY (provider, dedupe_key)
);
```

Design notes:

- This table prevents duplicate webhook handling when a provider retries events.
- `dedupe_key` should come from the provider event ID when available, or from a deterministic hash of the provider, event type, order ID, and delivery timestamp when an event ID is not available.
- `payload` is useful for audit and debugging, but webhook secrets and signature secrets must never be stored here.
- Processing should update `funding_transactions.payment_status` and `funding_transactions.delivery_status`.

To find webhook idempotency logic visit [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The webhook processing connection can be found in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).

## Indexes

```sql
CREATE INDEX idx_easyauth_wallets_user_id ON easyauth_wallets(user_id);
CREATE INDEX idx_easyauth_wallets_provider_owner_id ON easyauth_wallets(provider_owner_id);
CREATE INDEX idx_easyauth_funding_transactions_user_id ON easyauth_funding_transactions(user_id);
CREATE INDEX idx_easyauth_funding_transactions_wallet_id ON easyauth_funding_transactions(wallet_id);
CREATE INDEX idx_easyauth_funding_transactions_provider_order_id ON easyauth_funding_transactions(provider_order_id);
CREATE INDEX idx_easyauth_webhook_events_external_order_id ON easyauth_webhook_events(external_order_id);
```

Better Auth should generate or define its own auth-table indexes.

## Status Mapping

The UI should derive a simple user-facing state from payment and delivery fields:

```text
pending checkout: payment_status = pending
payment required: payment_status = requires_payment
identity check: payment_status = requires_kyc
payment received: payment_status = paid and delivery_status != completed
funded: payment_status = paid and delivery_status = completed
failed: payment_status = failed or delivery_status = failed
cancelled: payment_status = cancelled
```

## Deferred From v1

These are intentionally excluded until the core demo works:

- Agent wallets
- Multi-wallet users
- Custom key custody
- Raw OAuth/session implementation
- Full transaction history
- Analytics tables
- Phone OTP
- Multi-chain funding

## Environment Rules

- Store database URLs, Better Auth secrets, Google OAuth credentials, Crossmint API keys, and webhook secrets in `.env`.
- Ensure `.env` is ignored by Git before any implementation work.
- For Supabase Postgres on IPv4, prefer the pooler connection string with `sslmode=require` unless there is a verified reason not to.
