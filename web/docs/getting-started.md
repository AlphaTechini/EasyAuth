# Getting Started

This guide will help you integrate EasyAuth into your application in under 10 minutes.

## Prerequisites

- Node.js 20 or higher (for frontend SDK)
- A backend server (Node.js, Python, or Go)
- Google OAuth credentials
- Crossmint API key

## Installation

### Frontend

Install the frontend SDK package:

::: code-group

```bash [pnpm]
pnpm add @easyauth/frontend
```

```bash [npm]
npm install @easyauth/frontend
```

```bash [yarn]
yarn add @easyauth/frontend
```

:::

### Backend

Install the backend SDK package:

::: code-group

```bash [pnpm]
pnpm add @easyauth/backend @easyauth/shared
```

```bash [npm]
npm install @easyauth/backend @easyauth/shared
```

```bash [yarn]
yarn add @easyauth/backend @easyauth/shared
```

:::

## Environment Setup

Create a `.env` file in your backend project:

```dotenv
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Crossmint
CROSSMINT_API_KEY=your-crossmint-api-key
CROSSMINT_WEBHOOK_SECRET=your-crossmint-webhook-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easyauth

# App
NODE_ENV=development
```

### Getting API Keys

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)

#### Crossmint

1. Sign up at [Crossmint](https://www.crossmint.com/)
2. Create a new project
3. Get your API key from the dashboard
4. Configure webhook URL for funding status updates

## Database Setup

EasyAuth requires a PostgreSQL database. Run the schema migration:

```sql
-- Better Auth tables (generate using Better Auth CLI)
-- See: https://better-auth.com/docs/installation

-- EasyAuth tables
CREATE TABLE easyauth_wallets (
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

CREATE TABLE easyauth_funding_transactions (
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

CREATE TABLE easyauth_webhook_events (
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

-- Indexes
CREATE INDEX idx_easyauth_wallets_user_id ON easyauth_wallets(user_id);
CREATE INDEX idx_easyauth_wallets_provider_owner_id ON easyauth_wallets(provider_owner_id);
CREATE INDEX idx_easyauth_funding_transactions_user_id ON easyauth_funding_transactions(user_id);
CREATE INDEX idx_easyauth_funding_transactions_wallet_id ON easyauth_funding_transactions(wallet_id);
CREATE INDEX idx_easyauth_funding_transactions_provider_order_id ON easyauth_funding_transactions(provider_order_id);
CREATE INDEX idx_easyauth_webhook_events_external_order_id ON easyauth_webhook_events(external_order_id);
```

## Quick Start

### 1. Backend Setup (Node.js/Fastify)

```typescript
import Fastify from 'fastify'
import { registerEasyAuthRoutes } from '@easyauth/backend/integrations/fastify'
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'
import { createCrossmintWalletAdapter } from '@easyauth/backend/adapters/crossmint'
import { createCrossmintFundingAdapter } from '@easyauth/backend/adapters/crossmint'
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const fastify = Fastify()

const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL!
})

const authAdapter = createBetterAuthAdapter({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!
})

const walletAdapter = createCrossmintWalletAdapter({
  apiKey: process.env.CROSSMINT_API_KEY!
})

const fundingAdapter = createCrossmintFundingAdapter({
  apiKey: process.env.CROSSMINT_API_KEY!,
  webhookSecret: process.env.CROSSMINT_WEBHOOK_SECRET!
})

registerEasyAuthRoutes(fastify, {
  storage,
  authAdapter,
  walletAdapter,
  fundingAdapter
})

await fastify.listen({ port: 3000 })
```

### 2. Frontend Setup (Svelte)

```svelte
<script lang="ts">
  import { initEasyAuth } from '@easyauth/frontend'
  import { EasyAuthProvider } from '@easyauth/frontend/svelte/provider'
  import { LoginConnectModal } from '@easyauth/frontend/svelte/login-connect-modal'
  import { WalletCard } from '@easyauth/frontend/svelte/wallet-card'
  import { FundWalletCard } from '@easyauth/frontend/svelte/fund-wallet-card'

  const easyAuth = initEasyAuth({
    apiBaseUrl: '/api/easyauth'
  })
</script>

<EasyAuthProvider client={easyAuth}>
  <LoginConnectModal />
  <WalletCard />
  <FundWalletCard />
</EasyAuthProvider>
```

## Next Steps

- [Frontend Integration Guide](/frontend/) - Choose your frontend framework
- [Backend Integration Guide](/backend/) - Choose your backend language
- [API Reference](/api/) - Understand how EasyAuth works
- [API Reference](/api/frontend) - Explore the complete API

## Need Help?

- [GitHub Issues](https://github.com/AlphaTechini/EasyAuth/issues)
- [GitHub Discussions](https://github.com/AlphaTechini/EasyAuth/discussions)
