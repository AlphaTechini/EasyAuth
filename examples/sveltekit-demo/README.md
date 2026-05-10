# EasyAuth SvelteKit Demo

This demo application showcases the EasyAuth SDK in action, providing a complete authentication and wallet management experience.

## Features

- **Landing Page**: Feature cards, user flow description, and reasons to use EasyAuth
- **Social Authentication**: Google OAuth integration via Better Auth
- **Automatic Wallet Creation**: Solana wallets created automatically on sign-in
- **Dashboard**: View wallet address, balance, and fund wallet
- **Transaction History**: View all funding transactions with amount, date, and time
- **Embedded Funding**: Crossmint on-ramp integration for easy wallet funding

## Architecture

This demo consumes the EasyAuth SDK packages:
- `@easyauth/frontend` - Browser-safe client and Svelte UI components
- `@easyauth/backend` - Server-only services and Fastify integration
- `@easyauth/shared` - Shared types and contracts

### Tech Stack

- **Frontend**: SvelteKit 2 + Tailwind CSS
- **Backend**: Fastify + Better Auth
- **Wallet Provider**: Crossmint (Solana)
- **Storage**: In-memory (for demo purposes)

## Setup

### 1. Install Dependencies

From the workspace root:

```powershell
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```powershell
cd examples/sveltekit-demo
Copy-Item .env.example .env
```

Edit `.env` and add your credentials:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:5173
TRUSTED_ORIGINS=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Crossmint Configuration
CROSSMINT_API_KEY=your-crossmint-api-key
CROSSMINT_CLIENT_API_KEY=your-crossmint-client-api-key
CROSSMINT_WEBHOOK_SECRET=your-crossmint-webhook-secret
CROSSMINT_TOKEN_LOCATOR=your-crossmint-token-locator

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/easyauth_demo

# Server Configuration
PORT=3000
```

### 3. Build the SDK Packages

From the workspace root:

```powershell
pnpm build
```

### 4. Run the Demo

Start the Fastify backend server:

```powershell
cd examples/sveltekit-demo
pnpm server
```

In a separate terminal, start the SvelteKit dev server:

```powershell
cd examples/sveltekit-demo
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## User Flow

1. **Landing Page** (`/`)
   - View features and benefits
   - Click "Sign In" to authenticate

2. **Authentication** (`/auth`)
   - Choose social provider (Google)
   - Complete OAuth flow
   - Automatic wallet creation

3. **Dashboard** (`/dashboard`)
   - View wallet address and balance
   - Click "Fund Wallet" to add funds
   - Access quick actions

4. **Transaction History** (`/dashboard/history`)
   - View all funding transactions
   - See transaction status, amount, date, and time
   - View summary statistics

## API Endpoints

The Fastify backend exposes the following endpoints:

### Authentication
- `GET/POST /api/auth/*` - Better Auth endpoints

### Session
- `GET /api/session` - Get current user session

### Wallet
- `GET /api/wallet` - Get user's wallet
- `POST /api/wallet` - Create wallet (automatic)

### Balance
- `GET /api/wallet/balance` - Get wallet balance

### Funding
- `POST /api/funding/orders` - Create funding order
- `GET /api/funding/:id` - Get funding order status
- `GET /api/funding/history` - Get funding transaction history

### Webhooks
- `POST /api/webhooks/crossmint` - Crossmint webhook handler

### Health
- `GET /health` - Server health check

## Storage

This demo uses in-memory storage for simplicity. For production use, switch to the Postgres storage adapter:

```javascript
import { createPostgresStorage } from '@easyauth/backend/storage/postgres';

const storage = createPostgresStorage({
	connectionString: process.env.DATABASE_URL
});
```

## Customization

### Theming

The demo uses Tailwind CSS with a neutral black-and-white theme. To customize:

1. Edit `tailwind.config.js` to add custom colors
2. Modify component styles in the Svelte files
3. Use EasyAuth theme tokens for consistent styling

### Adding More Providers

To add GitHub, Twitter, or other OAuth providers:

1. Configure the provider in Better Auth
2. Add the provider button in `/auth/+page.svelte`
3. Update the authentication flow

## Production Considerations

Before deploying to production:

1. **Environment Variables**: Use secure secrets, not demo values
2. **Storage**: Switch to Postgres or another durable storage adapter
3. **Database**: Run migrations for Better Auth and EasyAuth schemas
4. **HTTPS**: Enable SSL/TLS for all endpoints
5. **CORS**: Configure CORS policies appropriately
6. **Rate Limiting**: Add rate limiting to API endpoints
7. **Error Handling**: Implement comprehensive error handling
8. **Monitoring**: Add logging and monitoring

## Troubleshooting

### "Session not found" error
- Ensure the backend server is running
- Check that cookies are enabled in your browser
- Verify Better Auth configuration

### Wallet creation fails
- Check Crossmint API credentials
- Verify network connectivity
- Review server logs for errors

### Funding doesn't work
- Ensure Crossmint project is configured correctly
- Check webhook endpoint is accessible
- Verify API keys have correct permissions

## Learn More

- [EasyAuth Documentation](../../README.md)
- [Better Auth Docs](https://better-auth.com)
- [Crossmint Docs](https://docs.crossmint.com)
- [SvelteKit Docs](https://kit.svelte.dev)
- [Fastify Docs](https://fastify.dev)

## License

This demo is part of the EasyAuth project.
