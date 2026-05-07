# React Integration

EasyAuth works seamlessly with React applications. While Svelte has first-class component support, React developers can use the same core client API to build custom components and hooks.

## Installation

::: code-group

```bash [pnpm]
pnpm add @easyauth/frontend react react-dom
```

```bash [npm]
npm install @easyauth/frontend react react-dom
```

```bash [yarn]
yarn add @easyauth/frontend react react-dom
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

### 2. Create a Context Provider

```tsx
// src/contexts/EasyAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { easyAuth } from '../lib/easyauth'
import type { EasyAuthSession, EasyAuthWallet, FundingTransaction } from '@easyauth/frontend'

interface EasyAuthContextValue {
  session: EasyAuthSession | null
  wallet: EasyAuthWallet | null
  funding: FundingTransaction | null
  loading: boolean
  error: Error | null
  login: () => Promise<void>
  logout: () => Promise<void>
  getWallet: () => Promise<void>
  fundWallet: (amount: number, currency: string) => Promise<void>
}

const EasyAuthContext = createContext<EasyAuthContextValue | undefined>(undefined)

export function EasyAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<EasyAuthSession | null>(null)
  const [wallet, setWallet] = useState<EasyAuthWallet | null>(null)
  const [funding, setFunding] = useState<FundingTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Load initial session
    const loadSession = async () => {
      try {
        const currentSession = await easyAuth.getSession()
        setSession(currentSession)
        
        if (currentSession) {
          const currentWallet = await easyAuth.getWallet()
          setWallet(currentWallet)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()

    // Subscribe to changes
    const unsubscribeSession = easyAuth.on('sessionChange', setSession)
    const unsubscribeWallet = easyAuth.on('walletChange', setWallet)
    const unsubscribeFunding = easyAuth.on('fundingChange', setFunding)

    return () => {
      unsubscribeSession()
      unsubscribeWallet()
      unsubscribeFunding()
    }
  }, [])

  const login = async () => {
    try {
      setError(null)
      await easyAuth.login()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await easyAuth.logout()
      setSession(null)
      setWallet(null)
      setFunding(null)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const getWallet = async () => {
    try {
      setError(null)
      const currentWallet = await easyAuth.getWallet()
      setWallet(currentWallet)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const fundWallet = async (amount: number, currency: string) => {
    try {
      setError(null)
      await easyAuth.fundWallet({ amount, currency })
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return (
    <EasyAuthContext.Provider
      value={{
        session,
        wallet,
        funding,
        loading,
        error,
        login,
        logout,
        getWallet,
        fundWallet
      }}
    >
      {children}
    </EasyAuthContext.Provider>
  )
}

export function useEasyAuth() {
  const context = useContext(EasyAuthContext)
  if (!context) {
    throw new Error('useEasyAuth must be used within EasyAuthProvider')
  }
  return context
}
```

### 3. Wrap Your App

```tsx
// src/App.tsx
import { EasyAuthProvider } from './contexts/EasyAuthContext'
import { Dashboard } from './components/Dashboard'

function App() {
  return (
    <EasyAuthProvider>
      <Dashboard />
    </EasyAuthProvider>
  )
}

export default App
```

## Custom Components

### Login Component

```tsx
// src/components/LoginButton.tsx
import { useEasyAuth } from '../contexts/EasyAuthContext'

export function LoginButton() {
  const { session, login, loading } = useEasyAuth()

  if (loading) {
    return <button disabled>Loading...</button>
  }

  if (session) {
    return <p>Welcome, {session.user.name}!</p>
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Login with Google
    </button>
  )
}
```

### Wallet Card Component

```tsx
// src/components/WalletCard.tsx
import { useState } from 'react'
import { useEasyAuth } from '../contexts/EasyAuthContext'

export function WalletCard() {
  const { wallet, getWallet, loading } = useEasyAuth()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="card">Loading wallet...</div>
  }

  if (!wallet) {
    return (
      <div className="card">
        <button onClick={getWallet}>Create Wallet</button>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>Your Wallet</h3>
      <div className="wallet-address">
        <code>{wallet.address}</code>
        <button onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {wallet.balance && (
        <p>Balance: {wallet.balance} SOL</p>
      )}
    </div>
  )
}
```

### Fund Wallet Component

```tsx
// src/components/FundWalletCard.tsx
import { useState } from 'react'
import { useEasyAuth } from '../contexts/EasyAuthContext'

export function FundWalletCard() {
  const { wallet, fundWallet } = useEasyAuth()
  const [amount, setAmount] = useState(50)
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFund = async () => {
    try {
      setLoading(true)
      setError(null)
      await fundWallet(amount, currency)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!wallet) {
    return null
  }

  return (
    <div className="card">
      <h3>Fund Your Wallet</h3>
      
      <div className="form-group">
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="10"
          max="1000"
        />
      </div>

      <div className="form-group">
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleFund}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Processing...' : `Fund ${amount} ${currency}`}
      </button>
    </div>
  )
}
```

### Funding Status Component

```tsx
// src/components/FundingStatusCard.tsx
import { useEasyAuth } from '../contexts/EasyAuthContext'

export function FundingStatusCard() {
  const { funding } = useEasyAuth()

  if (!funding) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded':
        return 'text-green-600'
      case 'failed':
      case 'cancelled':
        return 'text-red-600'
      case 'pending':
      case 'requires_action':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="card">
      <h3>Funding Status</h3>
      
      <div className="status-info">
        <p>
          Amount: {funding.fiatAmount} {funding.fiatCurrency}
        </p>
        <p className={getStatusColor(funding.status)}>
          Status: {funding.status.replace('_', ' ').toUpperCase()}
        </p>
        
        {funding.paymentStatus && (
          <p>Payment: {funding.paymentStatus}</p>
        )}
        
        {funding.deliveryStatus && (
          <p>Delivery: {funding.deliveryStatus}</p>
        )}
        
        {funding.failureReason && (
          <p className="error">Error: {funding.failureReason}</p>
        )}
      </div>
    </div>
  )
}
```

### Complete Dashboard

```tsx
// src/components/Dashboard.tsx
import { useEasyAuth } from '../contexts/EasyAuthContext'
import { LoginButton } from './LoginButton'
import { WalletCard } from './WalletCard'
import { FundWalletCard } from './FundWalletCard'
import { FundingStatusCard } from './FundingStatusCard'

export function Dashboard() {
  const { session, loading, error } = useEasyAuth()

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">Error: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Welcome to My Solana App</h1>
      
      <LoginButton />
      
      {session && (
        <div className="dashboard-grid">
          <WalletCard />
          <FundWalletCard />
          <FundingStatusCard />
        </div>
      )}
    </div>
  )
}
```

## Styling

Add basic styles:

```css
/* src/index.css */
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

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
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

.btn-primary:hover {
  background: #00d084;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  margin: 0.5rem 0;
}
```

## Next.js Integration

### App Router (Next.js 13+)

```tsx
// app/providers.tsx
'use client'

import { EasyAuthProvider } from '@/contexts/EasyAuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <EasyAuthProvider>{children}</EasyAuthProvider>
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Pages Router (Next.js 12 and below)

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { EasyAuthProvider } from '@/contexts/EasyAuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EasyAuthProvider>
      <Component {...pageProps} />
    </EasyAuthProvider>
  )
}
```

## TypeScript Support

EasyAuth is written in TypeScript and provides full type definitions:

```typescript
import type {
  EasyAuthClient,
  EasyAuthConfig,
  EasyAuthSession,
  EasyAuthWallet,
  FundingTransaction,
  FundingRequest
} from '@easyauth/frontend'
```

## Best Practices

1. **Single client instance** - Create one EasyAuth client and reuse it
2. **Context provider** - Use React Context for state management
3. **Error boundaries** - Wrap components in error boundaries
4. **Loading states** - Always show loading indicators
5. **Type safety** - Use TypeScript for better DX

## Next Steps

- [Backend Integration](/backend/nodejs) - Set up the Node.js backend
- [API Reference](/api/frontend) - Explore the complete frontend API
- [Common Patterns](/examples/common-patterns) - Advanced usage examples
