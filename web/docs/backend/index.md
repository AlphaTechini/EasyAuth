# Backend Integration

EasyAuth provides a server-only backend SDK that handles authentication, wallet management, funding, and webhook processing. The SDK is framework-agnostic with first-class support for Node.js/Fastify.

## Language Support

- **[Node.js](/backend/nodejs)** - First-class support with Fastify and Express
- **[Python](/backend/python)** - Implementation guide with contract specifications
- **[Go](/backend/golang)** - Implementation guide with contract specifications

## Core Features

### Authentication
- Better Auth integration for OAuth and sessions
- Session validation and user management
- Secure cookie handling

### Wallet Management
- Create or retrieve embedded Solana wallets
- Crossmint wallet adapter
- Idempotent wallet creation

### Funding
- Fiat-to-crypto funding orders
- Crossmint on-ramp integration
- Embedded and hosted checkout support

### Webhooks
- Crossmint webhook verification
- Idempotent event processing
- Status update handling

### Storage
- In-memory adapter for development
- PostgreSQL adapter for production
- Custom storage adapter support

## Installation (Node.js)

::: code-group

```bash [pnpm]
pnpm add @easyauth/backend @easyauth/shared pg
```

```bash [npm]
npm install @easyauth/backend @easyauth/shared pg
```

```bash [yarn]
yarn add @easyauth/backend @easyauth/shared pg
```

:::

## Basic Usage (Node.js/Fastify)

```typescript
import Fastify from 'fastify'
import { registerEasyAuthRoutes } from '@easyauth/backend/integrations/fastify'
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'
import { createCrossmintWalletAdapter, createCrossmintFundingAdapter } from '@easyauth/backend/adapters/crossmint'
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const fastify = Fastify()

// Initialize storage
const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL!
})

// Initialize adapters
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

// Register EasyAuth routes
registerEasyAuthRoutes(fastify, {
  storage,
  authAdapter,
  walletAdapter,
  fundingAdapter
})

await fastify.listen({ port: 3000 })
```

## API Routes

The backend SDK exposes these routes:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/session` | Get current session |
| GET | `/wallet` | Get user's wallet |
| POST | `/wallet` | Create user's wallet |
| POST | `/funding/orders` | Create funding order |
| GET | `/funding/:id` | Get funding status |
| POST | `/webhooks/crossmint` | Handle Crossmint webhooks |

## Architecture

### Adapter Pattern

EasyAuth uses adapters to keep provider-specific code isolated:

```typescript
interface AuthAdapter {
  getSession(request: any): Promise<Session | null>
}

interface WalletAdapter {
  createWallet(userId: string, options: WalletOptions): Promise<Wallet>
  getWallet(walletId: string): Promise<Wallet>
}

interface FundingAdapter {
  createOrder(request: FundingRequest): Promise<FundingOrder>
  verifyWebhook(payload: any, signature: string): boolean
}

interface StorageAdapter {
  getWalletByUserId(userId: string): Promise<Wallet | null>
  saveWallet(wallet: Wallet): Promise<void>
  createFundingTransaction(tx: FundingTransaction): Promise<void>
  updateFundingTransaction(id: string, updates: Partial<FundingTransaction>): Promise<void>
  // ... more methods
}
```

### Service Layer

Services contain business logic and are framework-agnostic:

```typescript
import { WalletService } from '@easyauth/backend'

const walletService = new WalletService({
  storage,
  walletAdapter
})

const wallet = await walletService.getOrCreateWallet(userId)
```

### Handler Layer

Handlers are framework-neutral request processors:

```typescript
import { createWalletHandler } from '@easyauth/backend/handlers'

const handler = createWalletHandler({
  storage,
  authAdapter,
  walletAdapter
})

// Use with any framework
const result = await handler(request)
```

## Configuration

### Environment Variables

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Crossmint
CROSSMINT_API_KEY=your-crossmint-api-key
CROSSMINT_WEBHOOK_SECRET=your-webhook-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easyauth

# App
NODE_ENV=development
```

### Storage Options

#### In-Memory (Development)

```typescript
import { createMemoryStorage } from '@easyauth/backend/storage/memory'

const storage = createMemoryStorage()
```

#### PostgreSQL (Production)

```typescript
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'

const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === 'production'
})
```

#### Custom Storage

```typescript
import type { StorageAdapter } from '@easyauth/backend'

class CustomStorage implements StorageAdapter {
  async getWalletByUserId(userId: string) {
    // Your implementation
  }
  
  async saveWallet(wallet: Wallet) {
    // Your implementation
  }
  
  // Implement other methods...
}

const storage = new CustomStorage()
```

## Security Best Practices

1. **Never expose API keys** - Keep secrets in environment variables
2. **Validate webhooks** - Always verify webhook signatures
3. **Use HTTPS** - Especially for production deployments
4. **Secure sessions** - Use secure, httpOnly cookies
5. **Rate limiting** - Implement rate limiting on auth endpoints
6. **Input validation** - Validate all user inputs
7. **Error handling** - Don't leak sensitive info in error messages

## Next Steps

Choose your backend language:

- [Node.js Integration](/backend/nodejs) - Fastify and Express examples
- [Python Integration](/backend/python) - Flask and FastAPI examples
- [Go Integration](/backend/golang) - Standard library and Gin examples
