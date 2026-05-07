# Backend SDK API

Complete reference for `@easyauth/backend`.

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

---

## Fastify Integration {#fastify-integration}

### registerEasyAuthRoutes()

Registers all six EasyAuth routes on a Fastify instance.

```typescript
import { registerEasyAuthRoutes } from '@easyauth/backend/integrations/fastify'

await fastify.register(registerEasyAuthRoutes, options)
```

#### Options

```typescript
interface EasyAuthFastifyOptions {
  /**
   * Route prefix applied to all EasyAuth routes.
   * @default '/api/easyauth'
   */
  prefix?: string

  /** Storage adapter — see createPostgresStorage / createMemoryStorage. */
  storage: StorageAdapter

  /** Auth adapter — see createBetterAuthAdapter. */
  authAdapter: AuthAdapter
}
```

#### Example

```typescript
import Fastify from 'fastify'
import { registerEasyAuthRoutes, registerEasyAuthFastifyRawBody } from '@easyauth/backend/integrations/fastify'
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const fastify = Fastify({ logger: true })

// Must be registered before EasyAuth routes so the webhook handler
// receives the raw body needed for Crossmint signature verification.
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
```

### registerEasyAuthFastifyRawBody()

Fastify plugin that preserves the raw request body on incoming requests. Required for Crossmint webhook signature verification. Must be registered before `registerEasyAuthRoutes`.

```typescript
import { registerEasyAuthFastifyRawBody } from '@easyauth/backend/integrations/fastify'

await fastify.register(registerEasyAuthFastifyRawBody)
```

---

## Adapters {#adapters}

### AuthAdapter

The interface your auth adapter must implement. EasyAuth ships a Better Auth implementation — you only need to implement this yourself if you are using a different auth system.

```typescript
interface AuthAdapter {
  /**
   * Extract and validate the session from an incoming request.
   * Returns the authenticated user, or null if the request is unauthenticated.
   */
  getSession(request: IncomingRequest): Promise<SessionUser | null>
}

interface SessionUser {
  id: string
  name: string
  email: string
  image?: string
}

interface IncomingRequest {
  headers: Record<string, string | string[] | undefined>
}
```

### createBetterAuthAdapter()

Creates an `AuthAdapter` backed by Better Auth.

```typescript
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'

const authAdapter = createBetterAuthAdapter(config)
```

#### Config

```typescript
interface BetterAuthAdapterConfig {
  /** Better Auth secret — must match BETTER_AUTH_SECRET in your .env. */
  secret: string

  /** Base URL of your Better Auth instance. */
  baseURL: string

  /** Google OAuth client ID. */
  googleClientId: string

  /** Google OAuth client secret. */
  googleClientSecret: string
}
```

---

### StorageAdapter {#storage-adapter}

The interface all storage adapters implement. Implement this to use your own database or ORM.

```typescript
interface StorageAdapter {
  // Wallet
  getWalletByUserId(userId: string): Promise<Wallet | null>
  getWalletById(id: string): Promise<Wallet | null>
  saveWallet(wallet: Wallet): Promise<void>

  // Funding
  createFundingTransaction(tx: FundingTransaction): Promise<void>
  updateFundingTransaction(id: string, updates: Partial<FundingTransaction>): Promise<void>
  getFundingTransaction(id: string): Promise<FundingTransaction | null>
  getFundingTransactionByOrderId(orderId: string): Promise<FundingTransaction | null>

  // Webhooks
  recordWebhookEvent(event: WebhookEvent): Promise<void>
  getWebhookEvent(provider: string, dedupeKey: string): Promise<WebhookEvent | null>
}
```

---

## Storage {#storage}

### createPostgresStorage()

Creates a `StorageAdapter` backed by a PostgreSQL database using the `pg` driver.

```typescript
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const storage = createPostgresStorage(config)
```

#### Config

```typescript
interface PostgresStorageConfig {
  /**
   * PostgreSQL connection string.
   * For Supabase, append ?sslmode=require to the pooler URL.
   * @example 'postgresql://user:pass@host:5432/dbname'
   */
  connectionString: string
}
```

### applySchema()

Runs the EasyAuth table migrations against your database. Safe to call on every startup — uses `CREATE TABLE IF NOT EXISTS` internally.

```typescript
import { applySchema } from '@easyauth/backend/storage/postgres'

await applySchema(process.env.DATABASE_URL!)
```

Call this once during your app's startup sequence or as a standalone migration script. It creates the three EasyAuth tables (`easyauth_wallets`, `easyauth_funding_transactions`, `easyauth_webhook_events`) and their indexes.

---

### createMemoryStorage()

Creates an in-memory `StorageAdapter`. State is lost on process restart. Use for local development and testing only.

```typescript
import { createMemoryStorage } from '@easyauth/backend/storage/memory'

const storage = createMemoryStorage()
```

---

## Services {#services}

Services contain the core business logic. They are framework-neutral — you can call them directly without going through route handlers.

### WalletService

```typescript
import { WalletService } from '@easyauth/backend'

const walletService = new WalletService({ storage, authAdapter })
```

#### Methods

```typescript
// Get the user's wallet, or create one if it does not exist.
walletService.getOrCreateWallet(userId: string): Promise<Wallet>

// Get an existing wallet by user ID. Returns null if not found.
walletService.getWallet(userId: string): Promise<Wallet | null>
```

### FundingService

```typescript
import { FundingService } from '@easyauth/backend'

const fundingService = new FundingService({ storage })
```

#### Methods

```typescript
// Create a new funding order.
fundingService.createOrder(request: CreateOrderRequest): Promise<FundingTransaction>

// Get a funding transaction by ID.
fundingService.getTransaction(id: string): Promise<FundingTransaction | null>
```

#### CreateOrderRequest

```typescript
interface CreateOrderRequest {
  userId: string
  walletId: string
  walletAddress: string
  amount: number
  currency: string
}
```

### WebhookService

```typescript
import { WebhookService } from '@easyauth/backend'

const webhookService = new WebhookService({ storage })
```

#### Methods

```typescript
// Process an incoming Crossmint webhook event idempotently.
webhookService.processEvent(event: RawWebhookEvent): Promise<void>
```

---

## Framework-Neutral Handlers {#handlers}

Handlers are thin wrappers around services that accept a normalised request object and return a normalised response. Use these when integrating with frameworks other than Fastify.

```typescript
import {
  createSessionHandler,
  createWalletHandler,
  createFundingHandler,
  createWebhookHandler
} from '@easyauth/backend/handlers'
```

All handlers follow the same request/response shape:

```typescript
interface HandlerRequest {
  headers: Record<string, string | string[] | undefined>
  params?: Record<string, string>
  body?: unknown
  rawBody?: Buffer  // required for webhook handler
}

interface HandlerResponse {
  status: number
  body: unknown
}
```

### createSessionHandler()

```typescript
const handler = createSessionHandler({ storage, authAdapter })
const response = await handler(request)
// response.body: { user: SessionUser } | { error: string }
```

### createWalletHandler()

```typescript
const handler = createWalletHandler({ storage, authAdapter })
const response = await handler(request)
// response.body: { wallet: Wallet } | { error: string }
```

### createFundingHandler()

```typescript
const handler = createFundingHandler({ storage, authAdapter })

// Create order
const createResponse = await handler.createOrder(request)
// request.body: { amount: number, currency?: string }

// Get status
const getResponse = await handler.getOrder(request)
// request.params: { id: string }
```

### createWebhookHandler()

```typescript
const handler = createWebhookHandler({ storage })
const response = await handler(request)
// request.rawBody: Buffer — required for signature verification
```

---

## Error Codes {#error-codes}

All handlers and services throw structured errors. In route handlers these are caught and serialised to HTTP responses automatically.

| Code | HTTP status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | No valid session on the request |
| `NOT_FOUND` | 404 | Wallet or transaction does not exist |
| `VALIDATION_ERROR` | 400 | Missing or invalid request parameters |
| `PROVIDER_ERROR` | 502 | Upstream Crossmint or Better Auth error |
| `WEBHOOK_INVALID` | 401 | Webhook signature verification failed |
| `INTERNAL_ERROR` | 500 | Unexpected error |

### Response Shape

All error responses follow this shape:

```typescript
{
  "error": "NOT_FOUND",
  "message": "Wallet not found for this user"
}
```

All success responses wrap the resource in a named key:

```typescript
{ "wallet": { ... } }
{ "transaction": { ... } }
{ "user": { ... } }
```

---

## TypeScript Types

All public types are re-exported from the package root:

```typescript
import type {
  StorageAdapter,
  AuthAdapter,
  EasyAuthBackendConfig,
  WalletService,
  FundingService,
  WebhookService
} from '@easyauth/backend'

import type {
  Wallet,
  FundingTransaction,
  WebhookEvent,
  SessionUser
} from '@easyauth/shared/models'
```
