# Frontend Integration

EasyAuth provides a browser-safe frontend SDK that works with any modern JavaScript framework. The SDK handles authentication, wallet management, and funding flows through a simple API.

## Framework Support

- **[Svelte](/frontend/svelte)** - First-class support with pre-built UI components
- **[React](/frontend/react)** - Integration guide with custom components
- **[Vue.js](/frontend/vue)** - Integration guide with custom components
- **[Angular](/frontend/angular)** - Integration guide with custom components

## Core Features

### Authentication
- Google OAuth login through Better Auth
- Session management
- Automatic session refresh

### Wallet Management
- Create or retrieve embedded Solana wallet
- Display wallet address and balance
- Copy address to clipboard

### Funding
- Initiate fiat-to-crypto funding
- Embedded checkout flow
- Real-time status tracking

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

## Basic Usage

All frameworks use the same core client API:

```typescript
import { initEasyAuth } from '@easyauth/frontend'

// Initialize the client
const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth'
})

// Login
await easyAuth.login()

// Get session
const session = await easyAuth.getSession()

// Get wallet
const wallet = await easyAuth.getWallet()

// Fund wallet
await easyAuth.fundWallet({
  amount: 50,
  currency: 'USD'
})

// Listen to events
easyAuth.on('sessionChange', (session) => {
  console.log('Session updated:', session)
})

easyAuth.on('walletChange', (wallet) => {
  console.log('Wallet updated:', wallet)
})

easyAuth.on('fundingChange', (funding) => {
  console.log('Funding status:', funding)
})
```

## UI Components

### Svelte (First-Class)

Svelte users get pre-built, themeable components:

```svelte
<script>
  import { EasyAuthProvider } from '@easyauth/frontend/svelte/provider'
  import { LoginConnectModal } from '@easyauth/frontend/svelte/login-connect-modal'
  import { WalletCard } from '@easyauth/frontend/svelte/wallet-card'
  import { FundWalletCard } from '@easyauth/frontend/svelte/fund-wallet-card'
  import { FundingStatusCard } from '@easyauth/frontend/svelte/funding-status-card'
</script>

<EasyAuthProvider client={easyAuth}>
  <LoginConnectModal />
  <WalletCard />
  <FundWalletCard />
  <FundingStatusCard />
</EasyAuthProvider>
```

### Other Frameworks

React, Vue, and Angular users can build custom components using the client API. See the framework-specific guides for examples.

## Theming

Customize the look and feel:

```typescript
import { defineEasyAuthTheme } from '@easyauth/frontend/theme'

const theme = defineEasyAuthTheme({
  colors: {
    primary: '#14f195',
    secondary: '#9945ff',
    background: '#ffffff',
    text: '#000000'
  },
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif'
})

const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth',
  theme
})
```

## Configuration Options

```typescript
interface EasyAuthConfig {
  // Backend API base URL (required)
  apiBaseUrl: string
  
  // Custom theme (optional)
  theme?: EasyAuthTheme
  
  // Custom fetch implementation (optional)
  fetch?: typeof fetch
  
  // Request timeout in milliseconds (optional, default: 30000)
  timeout?: number
}
```

## Next Steps

Choose your framework to see detailed integration examples:

- [Svelte Integration](/frontend/svelte) - Pre-built components and theming
- [React Integration](/frontend/react) - Custom hooks and components
- [Vue.js Integration](/frontend/vue) - Composition API integration
- [Angular Integration](/frontend/angular) - Service and component integration
