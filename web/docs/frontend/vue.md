# Vue.js Integration

EasyAuth integrates smoothly with Vue 3 applications using the Composition API. This guide shows you how to build custom components and composables.

## Installation

::: code-group

```bash [pnpm]
pnpm add @easyauth/frontend vue
```

```bash [npm]
npm install @easyauth/frontend vue
```

```bash [yarn]
yarn add @easyauth/frontend vue
```

:::

## Quick Start

### 1. Create the EasyAuth Client

```typescript
// src/lib/easyauth.ts
import { initEasyAuth } from '@easyauth/frontend'

export const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth'
})
```

### 2. Create a Composable

```typescript
// src/composables/useEasyAuth.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { easyAuth } from '../lib/easyauth'
import type { EasyAuthSession, EasyAuthWallet, FundingTransaction } from '@easyauth/frontend'

export function useEasyAuth() {
  const session = ref<EasyAuthSession | null>(null)
  const wallet = ref<EasyAuthWallet | null>(null)
  const funding = ref<FundingTransaction | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)

  const login = async () => {
    try {
      error.value = null
      await easyAuth.login()
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const logout = async () => {
    try {
      error.value = null
      await easyAuth.logout()
      session.value = null
      wallet.value = null
      funding.value = null
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const getWallet = async () => {
    try {
      error.value = null
      const currentWallet = await easyAuth.getWallet()
      wallet.value = currentWallet
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const fundWallet = async (amount: number, currency: string) => {
    try {
      error.value = null
      await easyAuth.fundWallet({ amount, currency })
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  onMounted(async () => {
    try {
      const currentSession = await easyAuth.getSession()
      session.value = currentSession
      
      if (currentSession) {
        const currentWallet = await easyAuth.getWallet()
        wallet.value = currentWallet
      }
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }

    // Subscribe to changes
    const unsubscribeSession = easyAuth.on('sessionChange', (newSession) => {
      session.value = newSession
    })
    
    const unsubscribeWallet = easyAuth.on('walletChange', (newWallet) => {
      wallet.value = newWallet
    })
    
    const unsubscribeFunding = easyAuth.on('fundingChange', (newFunding) => {
      funding.value = newFunding
    })

    onUnmounted(() => {
      unsubscribeSession()
      unsubscribeWallet()
      unsubscribeFunding()
    })
  })

  return {
    session,
    wallet,
    funding,
    loading,
    error,
    login,
    logout,
    getWallet,
    fundWallet
  }
}
```

### 3. Use in Components

```vue
<!-- src/components/Dashboard.vue -->
<script setup lang="ts">
import { useEasyAuth } from '../composables/useEasyAuth'
import LoginButton from './LoginButton.vue'
import WalletCard from './WalletCard.vue'
import FundWalletCard from './FundWalletCard.vue'
import FundingStatusCard from './FundingStatusCard.vue'

const { session, loading, error } = useEasyAuth()
</script>

<template>
  <div class="container">
    <h1>Welcome to My Solana App</h1>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>
    <div v-else>
      <LoginButton />
      
      <div v-if="session" class="dashboard-grid">
        <WalletCard />
        <FundWalletCard />
        <FundingStatusCard />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.error {
  color: #ef4444;
  padding: 1rem;
  background: #fee2e2;
  border-radius: 4px;
}
</style>
```

## Custom Components

### Login Button

```vue
<!-- src/components/LoginButton.vue -->
<script setup lang="ts">
import { useEasyAuth } from '../composables/useEasyAuth'

const { session, login, loading } = useEasyAuth()
</script>

<template>
  <button v-if="loading" disabled>Loading...</button>
  <p v-else-if="session">Welcome, {{ session.user.name }}!</p>
  <button v-else @click="login" class="btn-primary">
    Login with Google
  </button>
</template>

<style scoped>
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #14f195;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #00d084;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
```

### Wallet Card

```vue
<!-- src/components/WalletCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useEasyAuth } from '../composables/useEasyAuth'

const { wallet, getWallet, loading } = useEasyAuth()
const copied = ref(false)

const handleCopy = async () => {
  if (wallet.value?.address) {
    await navigator.clipboard.writeText(wallet.value.address)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="card">
    <div v-if="loading">Loading wallet...</div>
    <div v-else-if="!wallet">
      <button @click="getWallet">Create Wallet</button>
    </div>
    <div v-else>
      <h3>Your Wallet</h3>
      <div class="wallet-address">
        <code>{{ wallet.address }}</code>
        <button @click="handleCopy">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p v-if="wallet.balance">Balance: {{ wallet.balance }} SOL</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.wallet-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.wallet-address code {
  flex: 1;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
```

### Fund Wallet Card

```vue
<!-- src/components/FundWalletCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useEasyAuth } from '../composables/useEasyAuth'

const { wallet, fundWallet } = useEasyAuth()
const amount = ref(50)
const currency = ref('USD')
const loading = ref(false)
const error = ref<string | null>(null)

const handleFund = async () => {
  try {
    loading.value = true
    error.value = null
    await fundWallet(amount.value, currency.value)
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="wallet" class="card">
    <h3>Fund Your Wallet</h3>
    
    <div class="form-group">
      <label for="amount">Amount</label>
      <input
        id="amount"
        v-model.number="amount"
        type="number"
        min="10"
        max="1000"
      />
    </div>

    <div class="form-group">
      <label for="currency">Currency</label>
      <select id="currency" v-model="currency">
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button
      @click="handleFund"
      :disabled="loading"
      class="btn-primary"
    >
      {{ loading ? 'Processing...' : `Fund ${amount} ${currency}` }}
    </button>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.error {
  color: #ef4444;
  margin: 0.5rem 0;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #14f195;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
```

## Nuxt Integration

### Nuxt 3

Create a plugin:

```typescript
// plugins/easyauth.ts
import { initEasyAuth } from '@easyauth/frontend'

export default defineNuxtPlugin(() => {
  const easyAuth = initEasyAuth({
    apiBaseUrl: '/api/easyauth'
  })

  return {
    provide: {
      easyAuth
    }
  }
})
```

Use in components:

```vue
<script setup lang="ts">
const { $easyAuth } = useNuxtApp()

const session = ref(null)

onMounted(async () => {
  session.value = await $easyAuth.getSession()
})
</script>
```

## Best Practices

1. **Use composables** - Encapsulate EasyAuth logic in reusable composables
2. **Reactive state** - Use Vue's reactivity system for state management
3. **Error handling** - Always handle errors gracefully
4. **Loading states** - Show loading indicators during async operations
5. **TypeScript** - Use TypeScript for better type safety

## Next Steps

- [Backend Integration](/backend/nodejs) - Set up the Node.js backend
- [API Reference](/api/frontend) - Explore the complete frontend API
- [Common Patterns](/api/) - Advanced usage examples
