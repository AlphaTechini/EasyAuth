# Node.js Integration (First-Class)

Node.js with Fastify is the first-class backend target for EasyAuth. The SDK ships ready-to-use adapters and a Fastify plugin that registers all routes in one call.

::: tip Crossmint is handled for you
You do not need a Crossmint account. EasyAuth uses its own Crossmint integration under the hood. Wallets and funding work out of the box — you only wire up your database and Google OAuth credentials.
:::

## Installation

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

## Environment Variables

Create a `.env` file in your project root:

```dotenv
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth — create credentials at console.cloud.google.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Your database — EasyAuth stores wallet and funding state here
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# Environment
NODE_ENV=development
```

::: info What about Crossmint?
No Crossmint key is needed in your `.env`. EasyAuth manages the Crossmint integration centrally. If you later want to use your own Crossmint account, you can pass `crossmintApiKey` to the adapter config.
:::

## Fastify Setup (Recommended)

The fastest path. One function call registers all EasyAuth routes under a configurable prefix.

```typescript
// server.ts
import Fastify from 'fastify'
import { registerEasyAuthRoutes, registerEasyAuthFastifyRawBody } from '@easyauth/backend/integrations/fastify'
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const fastify = Fastify({ logger: true })

// Raw body plugin must be registered before EasyAuth routes
// so Crossmint webhook signature verification works correctly.
await fastify.register(registerEasyAuthFastifyRawBody)

const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL!
})

const authAdapter = createBetterAuthAdapter({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!
})

await fastify.register(registerEasyAuthRoutes, {
  prefix: '/api/easyauth',
  storage,
  authAdapter
})

await fastify.listen({ port: 3000, host: '0.0.0.0' })
```

That's it. The following routes are now live:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/easyauth/session` | Get current session |
| `GET` | `/api/easyauth/wallet` | Get or create wallet |
| `POST` | `/api/easyauth/wallet` | Explicitly create wallet |
| `POST` | `/api/easyauth/funding/orders` | Create funding order |
| `GET` | `/api/easyauth/funding/:id` | Get funding status |
| `POST` | `/api/easyauth/webhooks/crossmint` | Crossmint webhook receiver |

## Express Setup

If you are using Express instead of Fastify, use the framework-neutral handlers directly.

```typescript
// server.ts
import express from 'express'
import { createSessionHandler, createWalletHandler, createFundingHandler, createWebhookHandler } from '@easyauth/backend/handlers'
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const app = express()
app.use(express.json())

const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL!
})

const authAdapter = createBetterAuthAdapter({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!
})

const sessionHandler = createSessionHandler({ storage, authAdapter })
const walletHandler = createWalletHandler({ storage, authAdapter })
const fundingHandler = createFundingHandler({ storage, authAdapter })
const webhookHandler = createWebhookHandler({ storage })

// Session
app.get('/api/easyauth/session', async (req, res) => {
  const result = await sessionHandler({ headers: req.headers })
  res.status(result.status).json(result.body)
})

// Wallet
app.get('/api/easyauth/wallet', async (req, res) => {
  const result = await walletHandler.get({ headers: req.headers })
  res.status(result.status).json(result.body)
})

app.post('/api/easyauth/wallet', async (req, res) => {
  const result = await walletHandler.create({ headers: req.headers })
  res.status(result.status).json(result.body)
})

// Funding
app.post('/api/easyauth/funding/orders', async (req, res) => {
  const result = await fundingHandler.createOrder({
    headers: req.headers,
    body: req.body
  })
  res.status(result.status).json(result.body)
})

app.get('/api/easyauth/funding/:id', async (req, res) => {
  const result = await fundingHandler.getOrder({
    headers: req.headers,
    params: req.params
  })
  res.status(result.status).json(result.body)
})

// Webhooks — raw body required for signature verification
app.post('/api/easyauth/webhooks/crossmint',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const result = await webhookHandler({
      headers: req.headers,
      rawBody: req.body
    })
    res.status(result.status).json(result.body)
  }
)

app.listen(3000)
```

## Storage Options

### PostgreSQL (Production)

```typescript
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL!
  // For Supabase, append ?sslmode=require to your connection string
})
```

Run the schema migration once before starting your server:

```typescript
import { applySchema } from '@easyauth/backend/storage/postgres'

// Call this during your app's startup or as a one-off migration script.
// It is safe to run multiple times — it uses CREATE TABLE IF NOT EXISTS.
await applySchema(process.env.DATABASE_URL!)
```

### In-Memory (Development / Testing)

```typescript
import { createMemoryStorage } from '@easyauth/backend/storage/memory'

const storage = createMemoryStorage()
// State is lost on restart — only use for local development.
```

## Database Schema

EasyAuth creates three tables in your database. You own the database; EasyAuth only writes to these tables.

```sql
-- One wallet per user
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
  status TEXT NOT NULL DEFAULT 'creating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_wallet_per_user UNIQUE (user_id)
);

-- One row per funding attempt
CREATE TABLE easyauth_funding_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_id TEXT NOT NULL REFERENCES easyauth_wallets(id),
  provider_order_id TEXT UNIQUE,
  fiat_amount NUMERIC(12,2) NOT NULL,
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  delivery_status TEXT NOT NULL DEFAULT 'not_started',
  status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent webhook event log
CREATE TABLE easyauth_webhook_events (
  provider TEXT NOT NULL DEFAULT 'crossmint',
  dedupe_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider, dedupe_key)
);
```

## Better Auth Setup

EasyAuth uses Better Auth for session management. You need to initialise Better Auth separately in your app so it can handle the OAuth redirect flow.

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: new Pool({ connectionString: process.env.DATABASE_URL! }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  }
})
```

```typescript
// server.ts — mount Better Auth alongside EasyAuth
import { auth } from './lib/auth'

// Better Auth handles /api/auth/** routes
fastify.all('/api/auth/*', async (req, reply) => {
  const response = await auth.handler(req.raw)
  reply.send(response)
})
```

Better Auth will generate its own tables (`user`, `session`, `account`, `verification`) on first run. EasyAuth reads sessions from those tables through the auth adapter.

## Webhook Configuration

Crossmint sends webhook events to update funding status. In production, configure your webhook URL in the Crossmint console:

```
https://yourdomain.com/api/easyauth/webhooks/crossmint
```

For local development, use a tunnel tool to expose your local server:

```bash
# Using ngrok
ngrok http 3000
# Then set: https://abc123.ngrok.io/api/easyauth/webhooks/crossmint
```

## TypeScript Types

```typescript
import type {
  StorageAdapter,
  AuthAdapter,
  EasyAuthBackendConfig
} from '@easyauth/backend'

import type {
  Wallet,
  FundingTransaction,
  WebhookEvent
} from '@easyauth/shared/models'
```

## Error Handling

EasyAuth returns structured errors. All handlers follow the same shape:

```typescript
// Success
{ status: 200, body: { wallet: { ... } } }

// Auth error
{ status: 401, body: { error: 'UNAUTHORIZED', message: 'No active session' } }

// Not found
{ status: 404, body: { error: 'NOT_FOUND', message: 'Wallet not found' } }

// Validation error
{ status: 400, body: { error: 'VALIDATION_ERROR', message: '...' } }
```

In Fastify, these are forwarded directly. In Express, map `result.status` and `result.body` as shown in the Express example above.

## Next Steps

- [Frontend Integration](/frontend/) — Connect your Svelte, React, Vue, or Angular app
- [API Reference](/api/backend) — Full handler and adapter documentation
