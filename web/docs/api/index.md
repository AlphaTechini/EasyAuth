# API Reference

Complete reference for all public EasyAuth SDK APIs.

## Packages

| Package | Description |
|---------|-------------|
| [`@easyauth/frontend`](/api/frontend) | Browser-safe client, event emitter, and Svelte UI components |
| [`@easyauth/backend`](/api/backend) | Server-only services, adapters, handlers, and storage |
| `@easyauth/shared` | Types, route constants, and error codes shared by both packages |

## Quick Links

### Frontend
- [initEasyAuth()](/api/frontend#initEasyAuth) — create the client
- [EasyAuthClient methods](/api/frontend#client-methods) — login, getWallet, fundWallet
- [Events](/api/frontend#events) — sessionChange, walletChange, fundingChange
- [Svelte components](/api/frontend#svelte-components) — pre-built UI pieces
- [Theme API](/api/frontend#theme-api) — defineEasyAuthTheme

### Backend
- [Fastify integration](/api/backend#fastify-integration) — registerEasyAuthRoutes
- [Adapters](/api/backend#adapters) — AuthAdapter, StorageAdapter contracts
- [Services](/api/backend#services) — WalletService, FundingService
- [Storage](/api/backend#storage) — createPostgresStorage, createMemoryStorage
- [Error codes](/api/backend#error-codes) — structured error reference

## Route Contract

All backend integrations (Node.js, Python, Go) must expose these routes at the same paths so the frontend SDK can reach them:

| Method | Path | Auth required |
|--------|------|---------------|
| `GET` | `/api/easyauth/session` | No |
| `GET` | `/api/easyauth/wallet` | Yes |
| `POST` | `/api/easyauth/wallet` | Yes |
| `POST` | `/api/easyauth/funding/orders` | Yes |
| `GET` | `/api/easyauth/funding/:id` | Yes |
| `POST` | `/api/easyauth/webhooks/crossmint` | Signature |

The prefix `/api/easyauth` is the default. Node.js users can override it via the `prefix` option in `registerEasyAuthRoutes`. Python and Go users set the prefix in their router configuration.

## Shared Types

These types are exported from `@easyauth/shared` and used by both the frontend and backend packages.

### Wallet

```typescript
interface Wallet {
  id: string
  userId: string
  address: string
  provider: 'crossmint'
  chain: 'solana'
  network: 'devnet' | 'mainnet'
  status: 'creating' | 'active' | 'failed'
  createdAt: string
  updatedAt: string
}
```

### FundingTransaction

```typescript
interface FundingTransaction {
  id: string
  userId: string
  walletId: string
  providerOrderId: string | null
  fiatAmount: number
  fiatCurrency: string
  cryptoAsset: string
  paymentStatus: 'pending' | 'requires_kyc' | 'requires_payment' | 'paid' | 'failed' | 'cancelled'
  deliveryStatus: 'not_started' | 'pending' | 'completed' | 'failed'
  status: 'pending' | 'requires_action' | 'paid' | 'funded' | 'failed' | 'cancelled'
  failureReason: string | null
  createdAt: string
  updatedAt: string
}
```

### EasyAuthError

```typescript
interface EasyAuthError {
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'PROVIDER_ERROR' | 'INTERNAL_ERROR'
  message: string
  details?: unknown
}
```

### Route Constants

```typescript
import { ROUTES } from '@easyauth/shared/routes'

ROUTES.SESSION          // '/session'
ROUTES.WALLET           // '/wallet'
ROUTES.FUNDING_ORDERS   // '/funding/orders'
ROUTES.FUNDING_BY_ID    // '/funding/:id'
ROUTES.WEBHOOK          // '/webhooks/crossmint'
```
