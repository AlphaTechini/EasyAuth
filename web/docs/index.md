---
layout: home

hero:
  name: "EasyAuth"
  text: "Solana Onboarding Made Simple"
  tagline: The fastest way to onboard users with embedded wallets and seamless funding
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/AlphaTechini/EasyAuth

features:
  - icon: 🔐
    title: OAuth Authentication
    details: Google OAuth-based authentication through Better Auth with persistent app sessions.
  
  - icon: 💼
    title: Embedded Wallets
    details: One Solana wallet per authenticated user, powered by Crossmint's secure custody.
  
  - icon: 💳
    title: Fiat Funding
    details: Card-based funding through Crossmint on-ramp with real-time status tracking.
  
  - icon: 🎨
    title: Customizable UI
    details: First-class Svelte components with theming support. Works with React, Vue, and Angular.
  
  - icon: ⚡
    title: Framework Agnostic
    details: Backend SDK works with Node.js (Fastify/Express), Python, and Go.
  
  - icon: 📦
    title: Production Ready
    details: PostgreSQL storage, webhook handling, and comprehensive error management.
---

## Quick Example

```typescript
import { initEasyAuth } from '@easyauth/frontend'

const easyAuth = initEasyAuth({
  apiBaseUrl: '/api/easyauth'
})

// Login with Google
await easyAuth.login()

// Get wallet
const wallet = await easyAuth.getWallet()
console.log(wallet.address)

// Fund wallet
await easyAuth.fundWallet({
  amount: 50,
  currency: 'USD'
})
```

## Why EasyAuth?

Onboarding users into Solana apps is fragmented. Most apps require users to install wallet extensions, manage seed phrases, and use external exchanges before the app is useful.

**EasyAuth solves this** by providing a complete onboarding path:

```
identity → session → wallet → dashboard → funding
```

All through a simple SDK that takes minutes to integrate.

## What's Included

- **Frontend SDK** - Browser-safe client with Svelte UI components
- **Backend SDK** - Server-only services, adapters, and route handlers
- **Provider Adapters** - Better Auth for authentication, Crossmint for wallets and funding
- **Storage Options** - In-memory for development, PostgreSQL for production
- **Framework Support** - First-class Svelte and Fastify, with guides for React, Vue, Angular, Express, Python, and Go

## Get Started

Choose your stack and follow the integration guide:

- [Svelte Frontend](/frontend/svelte) + [Node.js Backend](/backend/nodejs) (First-Class)
- [React Frontend](/frontend/react)
- [Vue.js Frontend](/frontend/vue)
- [Angular Frontend](/frontend/angular)
- [Python Backend](/backend/python)
- [Go Backend](/backend/golang)
