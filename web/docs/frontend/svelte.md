# Svelte Integration (First-Class)

Svelte is the first-class frontend framework for EasyAuth. The SDK provides pre-built, themeable Svelte 5 components that handle the complete onboarding flow.

## Installation

::: code-group

```bash [pnpm]
pnpm add @easyauth/frontend svelte
```

```bash [npm]
npm install @easyauth/frontend svelte
```

```bash [yarn]
yarn add @easyauth/frontend svelte
```

:::

## Quick Start

### 1. Initialize the Client

```typescript
// src/lib/easyauth.ts
import { initEasyAuth } from '@easyauth/frontend'

export const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth'
})
```

### 2. Add Components to Your App

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { easyAuth } from '$lib/easyauth'
  import { EasyAuthProvider } from '@easyauth/frontend/svelte/provider'
  import { LoginConnectModal } from '@easyauth/frontend/svelte/login-connect-modal'
  import { WalletCard } from '@easyauth/frontend/svelte/wallet-card'
  import { FundWalletCard } from '@easyauth/frontend/svelte/fund-wallet-card'
  import { FundingStatusCard } from '@easyauth/frontend/svelte/funding-status-card'
  import '@easyauth/frontend/styles.css'
</script>

<EasyAuthProvider client={easyAuth}>
  <div class="container">
    <h1>Welcome to My Solana App</h1>
    
    <LoginConnectModal />
    
    <div class="dashboard">
      <WalletCard />
      <FundWalletCard />
      <FundingStatusCard />
    </div>
  </div>
</EasyAuthProvider>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
</style>
```

### 3. Import Styles

Add the default styles to your app:

```typescript
// src/routes/+layout.ts or +layout.svelte
import '@easyauth/frontend/styles.css'
```

## Available Components

### EasyAuthProvider

Context provider that makes the EasyAuth client available to all child components.

```svelte
<script>
  import { EasyAuthProvider } from '@easyauth/frontend/svelte/provider'
  import { easyAuth } from '$lib/easyauth'
</script>

<EasyAuthProvider client={easyAuth}>
  <!-- Your app components -->
</EasyAuthProvider>
```

### LoginConnectModal

Modal that handles Google OAuth login flow.

```svelte
<script>
  import { LoginConnectModal } from '@easyauth/frontend/svelte/login-connect-modal'
</script>

<LoginConnectModal />
```

**Features:**
- Automatic session detection
- Google OAuth button
- Loading states
- Error handling

### WalletCard

Displays wallet information with copy functionality.

```svelte
<script>
  import { WalletCard } from '@easyauth/frontend/svelte/wallet-card'
</script>

<WalletCard />
```

**Features:**
- Wallet address display
- Copy to clipboard
- Balance display (when available)
- Loading and error states

### FundWalletCard

Initiates the funding flow.

```svelte
<script>
  import { FundWalletCard } from '@easyauth/frontend/svelte/fund-wallet-card'
</script>

<FundWalletCard />
```

**Features:**
- Amount input
- Currency selection
- Embedded checkout trigger
- Validation

### FundingStatusCard

Displays current funding transaction status.

```svelte
<script>
  import { FundingStatusCard } from '@easyauth/frontend/svelte/funding-status-card'
</script>

<FundingStatusCard />
```

**Features:**
- Real-time status updates
- Payment status
- Delivery status
- Error messages

### EmbeddedCheckout

Crossmint embedded checkout component.

```svelte
<script>
  import { EmbeddedCheckout } from '@easyauth/frontend/svelte/embedded-checkout'
</script>

<EmbeddedCheckout />
```

**Features:**
- Embedded Crossmint UI
- Automatic order handling
- Status callbacks

### EasyAuthState

Reactive state component for custom UI.

```svelte
<script>
  import { EasyAuthState } from '@easyauth/frontend/svelte/state'
</script>

<EasyAuthState let:session let:wallet let:funding let:loading let:error>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>Error: {error.message}</p>
  {:else if session}
    <p>Welcome, {session.user.name}!</p>
    {#if wallet}
      <p>Wallet: {wallet.address}</p>
    {/if}
  {:else}
    <button on:click={() => easyAuth.login()}>Login</button>
  {/if}
</EasyAuthState>
```

## Theming

Customize the appearance using CSS variables or the theme API.

### CSS Variables

```css
/* src/app.css */
:root {
  --easyauth-primary: #14f195;
  --easyauth-secondary: #9945ff;
  --easyauth-background: #ffffff;
  --easyauth-text: #000000;
  --easyauth-border: #e5e7eb;
  --easyauth-border-radius: 8px;
  --easyauth-font-family: 'Inter', sans-serif;
}
```

### Theme API

```typescript
import { defineEasyAuthTheme } from '@easyauth/frontend/theme'

const theme = defineEasyAuthTheme({
  colors: {
    primary: '#14f195',
    secondary: '#9945ff',
    background: '#ffffff',
    text: '#000000',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981'
  },
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  }
})

const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth',
  theme
})
```

## Custom Components

Build your own UI using the client API:

```svelte
<script lang="ts">
  import { easyAuth } from '$lib/easyauth'
  import { onMount } from 'svelte'
  
  let session = $state(null)
  let wallet = $state(null)
  let loading = $state(true)
  
  onMount(async () => {
    try {
      session = await easyAuth.getSession()
      if (session) {
        wallet = await easyAuth.getWallet()
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      loading = false
    }
    
    // Listen to changes
    easyAuth.on('sessionChange', (newSession) => {
      session = newSession
    })
    
    easyAuth.on('walletChange', (newWallet) => {
      wallet = newWallet
    })
  })
  
  async function handleLogin() {
    try {
      await easyAuth.login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  async function handleFund() {
    try {
      await easyAuth.fundWallet({
        amount: 50,
        currency: 'USD'
      })
    } catch (error) {
      console.error('Funding failed:', error)
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if !session}
  <button onclick={handleLogin}>Login with Google</button>
{:else}
  <div>
    <h2>Welcome, {session.user.name}!</h2>
    {#if wallet}
      <p>Wallet: {wallet.address}</p>
      <button onclick={handleFund}>Fund Wallet</button>
    {/if}
  </div>
{/if}
```

## SvelteKit Integration

### Server-Side Session Check

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/easyauth/session')
    if (response.ok) {
      const session = await response.json()
      return { session }
    }
  } catch (error) {
    console.error('Failed to load session:', error)
  }
  
  return { session: null }
}
```

### Client-Side Hydration

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { easyAuth } from '$lib/easyauth'
  import { onMount } from 'svelte'
  import type { LayoutData } from './$types'
  
  let { data, children }: { data: LayoutData, children: any } = $props()
  
  onMount(() => {
    // Hydrate client with server session
    if (data.session) {
      easyAuth.setSession(data.session)
    }
  })
</script>

{@render children()}
```

## Best Practices

1. **Initialize once** - Create a single EasyAuth client instance and reuse it
2. **Use the provider** - Wrap your app with `EasyAuthProvider` for automatic state management
3. **Handle errors** - Always wrap API calls in try-catch blocks
4. **Listen to events** - Subscribe to state changes for reactive UI updates
5. **Server-side rendering** - Load session data on the server for better UX

## Next Steps

- [Backend Integration](/backend/nodejs) - Set up the Node.js backend
- [API Reference](/api/frontend) - Explore the complete frontend API
- [API Reference](/api/frontend) - Advanced theming examples
