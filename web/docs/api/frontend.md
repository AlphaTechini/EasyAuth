# Frontend SDK API

Complete reference for `@easyauth/frontend`.

## Installation

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

---

## initEasyAuth()

Creates and returns an `EasyAuthClient` instance. Call this once and reuse the result across your app.

```typescript
import { initEasyAuth } from '@easyauth/frontend'

const easyAuth = initEasyAuth(config: EasyAuthConfig): EasyAuthClient
```

### EasyAuthConfig

```typescript
interface EasyAuthConfig {
  /**
   * Base URL of your EasyAuth backend routes.
   * The client appends route paths to this value.
   * @example '/api/easyauth'
   */
  apiBaseUrl: string

  /**
   * Optional theme tokens applied to the built-in Svelte components.
   * Build a theme object with defineEasyAuthTheme().
   */
  theme?: EasyAuthTheme

  /**
   * Override the global fetch implementation.
   * Useful for testing or environments without native fetch.
   */
  fetch?: typeof fetch

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number
}
```

---

## Client Methods {#client-methods}

### login()

Initiates the Google OAuth flow. Redirects the user to Google and back to your app. Resolves after the redirect completes and a session is established.

```typescript
await easyAuth.login(): Promise<void>
```

### logout()

Ends the current session.

```typescript
await easyAuth.logout(): Promise<void>
```

### getSession()

Returns the current session, or `null` if the user is not authenticated.

```typescript
const session = await easyAuth.getSession(): Promise<EasyAuthSession | null>
```

#### EasyAuthSession

```typescript
interface EasyAuthSession {
  user: EasyAuthUser
  expiresAt: string
}

interface EasyAuthUser {
  id: string
  name: string
  email: string
  image: string | null
}
```

### getWallet()

Returns the user's wallet. Creates one automatically if it does not exist yet. Requires an active session.

```typescript
const wallet = await easyAuth.getWallet(): Promise<EasyAuthWallet>
```

#### EasyAuthWallet

```typescript
interface EasyAuthWallet {
  id: string
  address: string
  chain: 'solana'
  network: 'devnet' | 'mainnet'
  status: 'creating' | 'active' | 'failed'
}
```

### fundWallet()

Opens the Crossmint funding flow for the authenticated user's wallet.

```typescript
await easyAuth.fundWallet(request: FundingRequest): Promise<FundingTransaction>
```

#### FundingRequest

```typescript
interface FundingRequest {
  /** Amount in fiat currency. */
  amount: number

  /** ISO 4217 currency code.
   * @default 'USD'
   */
  currency?: string
}
```

### getFundingStatus()

Returns the current status of a funding transaction by ID.

```typescript
const tx = await easyAuth.getFundingStatus(id: string): Promise<FundingTransaction>
```

---

## Events {#events}

Subscribe to state changes with `on()`. The returned function unsubscribes the listener.

```typescript
const unsubscribe = easyAuth.on(event: EasyAuthEvent, handler: Function): () => void
```

### Available Events

| Event | Payload | Fired when |
|-------|---------|------------|
| `sessionChange` | `EasyAuthSession \| null` | User logs in or out |
| `walletChange` | `EasyAuthWallet \| null` | Wallet is created or updated |
| `fundingChange` | `FundingTransaction \| null` | Funding status changes |
| `error` | `EasyAuthError` | Any unhandled SDK error |

### Example

```typescript
const off = easyAuth.on('sessionChange', (session) => {
  if (session) {
    console.log('Logged in as', session.user.name)
  } else {
    console.log('Logged out')
  }
})

// Later, when you no longer need the listener:
off()
```

---

## Svelte Components {#svelte-components}

All components are exported via subpath imports and require `EasyAuthProvider` as an ancestor.

### EasyAuthProvider

Provides the EasyAuth client to all child components via Svelte context.

```typescript
import { EasyAuthProvider } from '@easyauth/frontend/svelte/provider'
```

```svelte
<EasyAuthProvider client={easyAuth}>
  <!-- all other EasyAuth components go here -->
</EasyAuthProvider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `client` | `EasyAuthClient` | Yes | The client returned by `initEasyAuth()` |

---

### LoginConnectModal

Renders a login button when the user is unauthenticated. Shows a connected state with the user's name and avatar when authenticated.

```typescript
import { LoginConnectModal } from '@easyauth/frontend/svelte/login-connect-modal'
```

```svelte
<LoginConnectModal />
```

No required props. Reads session state from context.

---

### WalletCard

Displays the user's wallet address with a copy button and current status.

```typescript
import { WalletCard } from '@easyauth/frontend/svelte/wallet-card'
```

```svelte
<WalletCard />
```

No required props. Reads wallet state from context.

---

### FundWalletCard

Renders an amount input and a button that opens the Crossmint funding flow.

```typescript
import { FundWalletCard } from '@easyauth/frontend/svelte/fund-wallet-card'
```

```svelte
<FundWalletCard />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultAmount` | `number` | `50` | Pre-filled amount |
| `defaultCurrency` | `string` | `'USD'` | Pre-selected currency |

---

### FundingStatusCard

Shows the status of the most recent funding transaction.

```typescript
import { FundingStatusCard } from '@easyauth/frontend/svelte/funding-status-card'
```

```svelte
<FundingStatusCard />
```

No required props. Reads funding state from context.

**Displayed states:**

| Status | Label shown |
|--------|-------------|
| `pending` | Pending checkout |
| `requires_payment` | Payment required |
| `requires_kyc` | Identity check |
| `paid` | Payment received |
| `funded` | Funded |
| `failed` | Failed |
| `cancelled` | Cancelled |

---

### EmbeddedCheckout

Mounts the Crossmint embedded checkout UI inside your app. Requires the host app to have `@crossmint/client-sdk-react-ui` installed.

```typescript
import { EmbeddedCheckout } from '@easyauth/frontend/svelte/embedded-checkout'
```

```svelte
<EmbeddedCheckout />
```

---

### EasyAuthState

Renderless component that exposes all SDK state as slot props. Use this to build fully custom UI while still reading from the shared context.

```typescript
import { EasyAuthState } from '@easyauth/frontend/svelte/state'
```

```svelte
<EasyAuthState let:session let:wallet let:funding let:loading let:error>
  {#if loading}
    <p>Loading…</p>
  {:else if !session}
    <button onclick={() => easyAuth.login()}>Sign in</button>
  {:else}
    <p>Welcome, {session.user.name}</p>
    {#if wallet}
      <p>Wallet: {wallet.address}</p>
    {/if}
  {/if}
</EasyAuthState>
```

| Slot prop | Type | Description |
|-----------|------|-------------|
| `session` | `EasyAuthSession \| null` | Current session |
| `wallet` | `EasyAuthWallet \| null` | Current wallet |
| `funding` | `FundingTransaction \| null` | Latest funding transaction |
| `loading` | `boolean` | True while initial state is loading |
| `error` | `EasyAuthError \| null` | Last error, if any |

---

## Theme API {#theme-api}

### defineEasyAuthTheme()

Creates a typed theme object to pass to `initEasyAuth()`.

```typescript
import { defineEasyAuthTheme } from '@easyauth/frontend/theme'

const theme = defineEasyAuthTheme({
  colors: {
    primary: '#14f195',
    secondary: '#9945ff',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981'
  },
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif'
})

const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth',
  theme
})
```

### EasyAuthTheme

```typescript
interface EasyAuthTheme {
  colors?: {
    primary?: string
    secondary?: string
    background?: string
    surface?: string
    text?: string
    textMuted?: string
    border?: string
    error?: string
    success?: string
  }
  borderRadius?: string
  fontFamily?: string
}
```

### CSS Variables

All theme tokens are also available as CSS variables on the component root. You can override them directly in your stylesheet without using the theme API:

```css
:root {
  --ea-primary: #14f195;
  --ea-secondary: #9945ff;
  --ea-background: #ffffff;
  --ea-surface: #f9fafb;
  --ea-text: #111827;
  --ea-text-muted: #6b7280;
  --ea-border: #e5e7eb;
  --ea-error: #ef4444;
  --ea-success: #10b981;
  --ea-radius: 8px;
  --ea-font: Inter, system-ui, sans-serif;
}
```

---

## Default Styles

Import the default stylesheet to get the built-in component styles:

```typescript
import '@easyauth/frontend/styles.css'
```

This is optional. If you prefer to style components entirely with your own CSS, skip this import and use the CSS variables above.

---

## Error Handling

All client methods throw `EasyAuthError` on failure. Wrap calls in try/catch:

```typescript
try {
  await easyAuth.fundWallet({ amount: 50 })
} catch (err) {
  if (err instanceof EasyAuthError) {
    console.error(err.code, err.message)
  }
}
```

### Error Codes

| Code | HTTP equivalent | Meaning |
|------|-----------------|---------|
| `UNAUTHORIZED` | 401 | No active session |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `PROVIDER_ERROR` | 502 | Crossmint or Better Auth returned an error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
