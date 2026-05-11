# Quick Setup Guide

This guide will help you get the EasyAuth SvelteKit demo running quickly.

## Prerequisites

- Node.js 20.6+ installed
- pnpm installed (`npm install -g pnpm`)
- Google OAuth credentials (for authentication)
- Crossmint API credentials (for wallet and funding)
- PostgreSQL database (optional locally, recommended for deployment)

## Step 1: Install Dependencies

From the workspace root:

```powershell
cd C:\Hackathons\EasyAuth
pnpm install
```

## Step 2: Build SDK Packages

The demo depends on the EasyAuth SDK packages, so build them first:

```powershell
pnpm build
```

## Step 3: Configure Environment

Navigate to the demo directory and create your `.env` file:

```powershell
cd examples\sveltekit-demo
Copy-Item .env.example .env
```

Edit `.env` and add your credentials:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-random-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:5173
TRUSTED_ORIGINS=http://localhost:5173

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Crossmint Configuration (Get from Crossmint Console)
CROSSMINT_API_KEY=your-crossmint-api-key
CROSSMINT_CLIENT_API_KEY=your-crossmint-client-api-key
CROSSMINT_WEBHOOK_SECRET=your-crossmint-webhook-secret
CROSSMINT_TOKEN_LOCATOR=your-crossmint-token-locator

# Database (optional locally, recommended for deployment)
DATABASE_URL=
EASYAUTH_RUN_MIGRATIONS=false

# Optional standalone Fastify server configuration
PORT=3000
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:5173/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### Getting Crossmint Credentials

1. Go to [Crossmint Console](https://www.crossmint.com/console)
2. Create a new project
3. Get your API keys, webhook secret, and token locator from the dashboard
4. Copy them to `.env`

## Step 4: Start the Demo

```powershell
cd examples\sveltekit-demo
pnpm dev
```

You should see:
```
Local: http://localhost:5173/
```

The SvelteKit dev server hosts both the UI and `/api/*` backend routes. The optional `pnpm server` command starts the standalone Fastify backend for SDK integration experiments.

## Step 5: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign In" on the landing page
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. You'll be redirected to the dashboard
6. View your wallet address and balance
7. Click "Fund Wallet" to test funding flow
8. Visit "Transaction History" to see funding records

## Troubleshooting

### "Session not found" error
- Make sure the SvelteKit dev server is running on port 5173
- Check that cookies are enabled in your browser
- Verify `BETTER_AUTH_URL` matches your app URL

### Wallet creation fails
- Check Crossmint API credentials are correct
- Verify you have network connectivity
- Check server logs for detailed error messages

### Google OAuth fails
- Verify redirect URI is configured correctly in Google Console
- Check Client ID and Secret are correct
- Make sure Google+ API is enabled

### Port already in use
- Change `PORT` in `.env` to a different port
- Update `BETTER_AUTH_URL` to match the new port
- Restart the dev server

## Next Steps

- Customize the UI in the Svelte components
- Switch to Postgres storage for production
- Add more OAuth providers (GitHub, Twitter)
- Deploy to production (Vercel, Railway, etc.)

## Production Deployment

Before deploying to production:

1. Generate a secure `BETTER_AUTH_SECRET` (min 32 characters)
2. Use production OAuth credentials
3. Configure Postgres storage and apply Better Auth plus EasyAuth database schemas
4. Enable HTTPS for all endpoints
5. Configure CORS policies
6. Add rate limiting
7. Set up monitoring and logging

## Support

For issues or questions:
- Check the [main README](./README.md)
- Review [EasyAuth documentation](../../README.md)
- Check server logs for error details
