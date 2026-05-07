# EasyAuth Testing Guide

## 🚀 Starting the Documentation Site

```bash
cd web
pnpm docs:dev
```

The site will open at `http://localhost:5173`

---

## ✅ YES! You Can Test Without Real Money

**Crossmint provides a complete staging/testnet environment** for testing without spending real funds.

### Two Environments

1. **Staging** (https://staging.crossmint.com) - For development and testing
2. **Production** (https://www.crossmint.com) - For live projects

### How It Works

#### 1. **Testnet Wallets**
- Wallets are created on **Solana Devnet** (not mainnet)
- No real SOL or USDC is used
- Wallets are real, valid Solana addresses - just on devnet

#### 2. **Test Credit Cards**
Crossmint provides test card numbers that simulate real payments:

```
Visa: 4242 4242 4242 4242
Visa Debit: 4000 0566 5566 5556
Mastercard: 5555 5555 5555 4444
Mastercard Debit: 5200 8282 8282 8210

CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
```

These cards **do not charge real money** in staging mode.

#### 3. **Test Stablecoin (USDXM)**
Crossmint has a staging stablecoin called **USDXM** (like USDC for testnets):
- Available on all supported testnets
- No real-world value
- Can be obtained for free via faucet

### Testing Limits in Staging

To preserve testnet tokens, Crossmint imposes low limits:

| Chain | Maximum Amount |
|-------|----------------|
| Solana (Devnet) | 0.001 SOL |
| Ethereum (Sepolia) | 0.000005 ETH |
| Polygon (Amoy) | 0.005 MATIC |
| USDC/USDXM | $10 |

### Getting Test Funds

#### Option 1: Crossmint Faucet (Easiest)
Visit: https://usdc-faucet.vercel.app/
1. Enter your wallet address
2. Select the chain (Solana Devnet)
3. Request tokens

#### Option 2: Solana Devnet Faucet
Visit: https://faucet.solana.com/
1. Enter your wallet address
2. Request devnet SOL (for gas fees)

#### Option 3: Programmatic Funding (SDK)
```typescript
// Crossmint provides a stagingFund method
const balances = await wallet.stagingFund(10) // Adds 10 USDXM
```

---

## 🔧 Environment Variables for Testing

Create a `.env` file with **staging credentials**:

```env
# Environment
NODE_ENV=development

# Better Auth (your own)
BETTER_AUTH_SECRET=your-dev-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (create test credentials)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Crossmint STAGING (get from staging.crossmint.com)
CROSSMINT_API_KEY=sk_staging_xxxxxxxxxxxxx
CROSSMINT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
CROSSMINT_ENVIRONMENT=staging

# Database (local or test database)
DATABASE_URL=postgresql://user:password@localhost:5432/easyauth_dev

# Solana Network
SOLANA_NETWORK=devnet
```

### Getting Crossmint Staging Credentials

1. Go to https://staging.crossmint.com
2. Create an account (free)
3. Create a new project
4. Get your **staging API key** from the dashboard
5. Configure webhook URL (for local testing, use ngrok or similar)

---

## 🎯 Complete Testing Flow

### 1. User Signs In with Google
- Uses real Google OAuth (test with your own Google account)
- Creates a session in your database
- **No cost, works normally**

### 2. Wallet Creation
- Creates a wallet on **Solana Devnet**
- Wallet address is real and valid
- Can be viewed on Solana Explorer (devnet mode)
- **No cost, instant**

### 3. Funding Flow
- User clicks "Fund Wallet"
- Enters amount (e.g., $50)
- Crossmint checkout opens
- User enters **test credit card** (4242 4242 4242 4242)
- Payment is "processed" (simulated, no real charge)
- USDXM tokens are sent to the devnet wallet
- **No real money spent**

### 4. Verification
You can verify the wallet and transactions:

**Solana Explorer (Devnet):**
```
https://explorer.solana.com/?cluster=devnet
```

Paste your wallet address to see:
- Balance
- Transaction history
- Token holdings (USDXM)

**Crossmint Console:**
```
https://staging.crossmint.com/console
```

View:
- All wallets created
- All funding orders
- Order status and history

---

## 📊 SDK Architecture - User's Own Infrastructure

Yes, **users of your SDK provide their own infrastructure**:

### What Users Provide

1. **Database**
   - PostgreSQL (or compatible)
   - Users run their own database
   - SDK provides schema, not the database itself

2. **Backend Server**
   - Node.js/Fastify, Python, or Go
   - Users host their own server
   - SDK provides the code, not the hosting

3. **API Keys**
   - Users get their own Crossmint API keys
   - Users get their own Google OAuth credentials
   - Users set their own Better Auth secrets

4. **Environment**
   - Users choose staging or production
   - Users manage their own `.env` files

### What Your SDK Provides

1. **Code/Packages**
   - `@easyauth/frontend` - Frontend SDK
   - `@easyauth/backend` - Backend SDK
   - `@easyauth/shared` - Shared types

2. **Adapters**
   - Better Auth adapter
   - Crossmint wallet adapter
   - Crossmint funding adapter
   - Storage adapters (memory, PostgreSQL)

3. **Documentation**
   - Integration guides
   - API reference
   - Example code

4. **Schema**
   - SQL schema for database tables
   - Migration scripts

### Example: How a User Integrates

```typescript
// User's backend server (they host this)
import Fastify from 'fastify'
import { registerEasyAuthRoutes } from '@easyauth/backend/integrations/fastify'
import { createPostgresStorage } from '@easyauth/backend/storage/postgres'
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth'
import { createCrossmintWalletAdapter } from '@easyauth/backend/adapters/crossmint'

const fastify = Fastify()

// User provides their own database
const storage = createPostgresStorage({
  connectionString: process.env.DATABASE_URL // User's database
})

// User provides their own API keys
const authAdapter = createBetterAuthAdapter({
  secret: process.env.BETTER_AUTH_SECRET, // User's secret
  baseURL: process.env.BETTER_AUTH_URL
})

const walletAdapter = createCrossmintWalletAdapter({
  apiKey: process.env.CROSSMINT_API_KEY, // User's Crossmint key
  environment: process.env.CROSSMINT_ENVIRONMENT // 'staging' or 'production'
})

// Your SDK provides the integration logic
registerEasyAuthRoutes(fastify, {
  storage,
  authAdapter,
  walletAdapter,
  fundingAdapter
})

// User hosts and runs their own server
await fastify.listen({ port: 3000 })
```

---

## 🧪 Testing Checklist

### Phase 1: Local Development (Staging)
- [ ] Set up local PostgreSQL database
- [ ] Get Crossmint staging API key
- [ ] Get Google OAuth test credentials
- [ ] Configure `.env` with staging values
- [ ] Run backend server locally
- [ ] Test Google login
- [ ] Test wallet creation (devnet)
- [ ] Test funding with test card
- [ ] Verify wallet on Solana Explorer (devnet)

### Phase 2: Integration Testing
- [ ] Test webhook delivery (use ngrok for local testing)
- [ ] Test funding status updates
- [ ] Test error scenarios (declined cards, etc.)
- [ ] Test session persistence
- [ ] Test wallet retrieval (idempotency)

### Phase 3: Production Preparation
- [ ] Get Crossmint production API key
- [ ] Get Google OAuth production credentials
- [ ] Set up production database
- [ ] Configure production `.env`
- [ ] Test with small real amounts first
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring

---

## 🔗 Useful Resources

### Crossmint
- Staging Console: https://staging.crossmint.com
- Production Console: https://www.crossmint.com
- Docs: https://docs.crossmint.com
- Test Cards: https://docs.crossmint.com/payments/advanced/testing-tips
- USDXM Faucet: https://usdc-faucet.vercel.app/

### Solana
- Devnet Explorer: https://explorer.solana.com/?cluster=devnet
- Devnet Faucet: https://faucet.solana.com/
- Docs: https://solana.com/docs

### Better Auth
- Docs: https://better-auth.com/docs
- Fastify Integration: https://better-auth.com/docs/integrations/fastify

### Google OAuth
- Console: https://console.cloud.google.com/
- OAuth Setup: https://developers.google.com/identity/protocols/oauth2

---

## 💡 Pro Tips

1. **Start with staging** - Always test in staging first
2. **Use test cards** - Never use real cards in staging
3. **Check devnet explorer** - Verify transactions on Solana Explorer
4. **Monitor webhooks** - Use ngrok or similar for local webhook testing
5. **Small production tests** - Start with $1-5 when moving to production
6. **Keep staging/production separate** - Use different API keys and databases

---

## ❓ Common Questions

**Q: Are devnet wallets real Solana addresses?**
A: Yes! They're valid Solana addresses, just on the devnet network instead of mainnet.

**Q: Can I send real SOL to a devnet wallet?**
A: No, devnet and mainnet are separate networks. Devnet wallets only work on devnet.

**Q: Do test credit cards charge real money?**
A: No, test cards in staging mode never charge real money.

**Q: How do I switch from staging to production?**
A: Change your API keys and environment variables from staging to production values.

**Q: Can I test webhooks locally?**
A: Yes, use ngrok or similar tools to expose your local server to the internet.

**Q: Do I need to pay for Crossmint staging?**
A: No, staging is free for development and testing.
