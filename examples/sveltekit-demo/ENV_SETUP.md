# Environment Variables Setup

## Current Issue

Your `.env` file has been reset to placeholder values. You need to restore the actual values from Vercel.

## Required Environment Variables

### 1. Better Auth Configuration

```env
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://your-app.vercel.app
TRUSTED_ORIGINS=https://your-app.vercel.app,http://localhost:5174
```

**Important:**
- `BETTER_AUTH_URL` must match your deployment URL (Vercel URL)
- For local development, use `http://localhost:5174`
- `TRUSTED_ORIGINS` should include both production and local URLs

### 2. Google OAuth

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret
```

**Google Cloud Console Settings:**

Your **Authorized redirect URIs** must include:
- `https://your-app.vercel.app/api/auth/callback/google` (production)
- `http://localhost:5174/api/auth/callback/google` (local dev)

**The redirect URL IS required** - Better Auth handles it automatically at `/api/auth/callback/google`

### 3. Crossmint Configuration

```env
CROSSMINT_API_KEY=your-crossmint-api-key
CROSSMINT_CLIENT_API_KEY=your-crossmint-client-api-key
CROSSMINT_WEBHOOK_SECRET=your-crossmint-webhook-secret
CROSSMINT_TOKEN_LOCATOR=your-crossmint-token-locator
```

### 4. Database (Optional for local, required for production)

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
EASYAUTH_RUN_MIGRATIONS=true
```

## How to Get Values from Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Copy each variable value
4. Paste into your local `.env` file

## Why Google Auth Might Still Not Work

Even with correct environment variables, Google Auth can fail if:

### 1. Redirect URI Mismatch

**Problem:** The redirect URI in your Google Cloud Console doesn't match the actual callback URL.

**Solution:**
- Go to Google Cloud Console → Credentials
- Edit your OAuth 2.0 Client ID
- Ensure these URIs are added:
  - `https://your-actual-vercel-url.vercel.app/api/auth/callback/google`
  - `http://localhost:5174/api/auth/callback/google`

**Note:** The redirect URI must be **EXACT** - no trailing slashes, correct protocol (http vs https)

### 2. BETTER_AUTH_URL Mismatch

**Problem:** `BETTER_AUTH_URL` in `.env` doesn't match your actual deployment URL.

**Solution:**
- If deployed on Vercel: `BETTER_AUTH_URL=https://your-app.vercel.app`
- If testing locally: `BETTER_AUTH_URL=http://localhost:5174`

**Important:** When testing locally, you MUST update `BETTER_AUTH_URL` to `http://localhost:5174`

### 3. OAuth Consent Screen Not Configured

**Problem:** Google OAuth consent screen is not properly configured.

**Solution:**
- Go to Google Cloud Console → OAuth consent screen
- Fill in required fields (app name, support email, etc.)
- Add test users if in "Testing" mode
- Publish the app if ready for production

### 4. Crossmint API Keys Invalid

**Problem:** Wallet creation fails even if auth succeeds.

**Solution:**
- Verify Crossmint API keys are valid
- Check Crossmint dashboard for any issues
- Ensure you're using the correct environment (staging vs production)

## Testing Locally

### Step 1: Update .env for Local Development

```env
BETTER_AUTH_URL=http://localhost:5174
TRUSTED_ORIGINS=http://localhost:5174
```

### Step 2: Add Local Redirect URI to Google Cloud

Add this to your Google OAuth credentials:
```
http://localhost:5174/api/auth/callback/google
```

### Step 3: Restart Dev Server

```bash
# Stop current server
# Then restart
pnpm dev
```

### Step 4: Test the Flow

1. Go to http://localhost:5174/auth
2. Click "Continue with Google"
3. Should redirect to Google consent screen
4. After approval, should redirect back to `/dashboard`

## Common Errors and Solutions

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI doesn't match what's configured in Google Cloud Console.

**Fix:**
1. Check the error message for the actual redirect URI being used
2. Add that exact URI to Google Cloud Console
3. Wait a few minutes for changes to propagate

### Error: "invalid_client"

**Cause:** `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is incorrect.

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Copy the correct Client ID and Client Secret
3. Update `.env` file
4. Restart server

### Error: "access_denied"

**Cause:** User denied permission or app is not verified.

**Fix:**
1. Ensure OAuth consent screen is configured
2. Add test users if in "Testing" mode
3. Try with a different Google account

### Error: Environment variable not found

**Cause:** `.env` file not loaded or values are placeholders.

**Fix:**
1. Ensure `.env` file exists in `examples/sveltekit-demo/`
2. Check that values don't start with `your-`
3. Restart dev server after updating `.env`

## Production Deployment on Vercel

### Step 1: Set Environment Variables in Vercel

Go to Vercel project → Settings → Environment Variables

Add all variables with production values:
- `BETTER_AUTH_URL` = Your Vercel URL
- `GOOGLE_CLIENT_ID` = Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` = Your Google OAuth Client Secret
- All Crossmint variables
- `DATABASE_URL` (if using database)

### Step 2: Update Google Cloud Console

Add your Vercel URL to authorized redirect URIs:
```
https://your-app.vercel.app/api/auth/callback/google
```

### Step 3: Redeploy

Vercel will automatically redeploy when you push to your git repository.

## Quick Checklist

Before testing Google Auth, verify:

- [ ] `.env` file has actual values (not placeholders)
- [ ] `BETTER_AUTH_URL` matches your current environment
- [ ] Google Cloud Console has correct redirect URIs
- [ ] OAuth consent screen is configured
- [ ] Dev server has been restarted after `.env` changes
- [ ] Browser cache cleared (or use incognito mode)

## Still Not Working?

If Google Auth still fails after following all steps:

1. **Check browser console** for error messages
2. **Check server logs** for backend errors
3. **Verify network requests** in browser DevTools
4. **Test with a different Google account**
5. **Try in incognito mode** to rule out cache issues

## Summary

The redirect URL **IS required** and Better Auth handles it automatically at:
```
/api/auth/callback/google
```

You just need to:
1. Restore your `.env` values from Vercel
2. Ensure `BETTER_AUTH_URL` matches your environment
3. Verify Google Cloud Console has the correct redirect URIs
4. Restart your dev server

The most common issue is a mismatch between:
- `BETTER_AUTH_URL` in `.env`
- Authorized redirect URIs in Google Cloud Console
- The actual URL you're accessing the app from
