# EasyAuth

> The fastest way to onboard users to Solana with embedded wallets and seamless funding.

EasyAuth is a developer-facing onboarding layer for Solana apps. It handles login, creates or retrieves an embedded wallet for the authenticated user, shows a usable wallet dashboard, and lets the user fund that wallet through a fiat on-ramp.

See the project map in [structure.md](file:///C:/Hackathons/EasyAuth/structure.md).

## Problem

Onboarding users into Solana apps is still too fragmented.

Most apps require users to:

- Install a wallet extension.
- Manage a seed phrase.
- Copy wallet addresses between services.
- Use an external exchange before the app is useful.

Even when a wallet is created automatically, users often land in the app with an empty wallet and no obvious funding path.

## Solution

EasyAuth gives developers a small integration surface for the complete onboarding path:

- Authenticate users with OAuth.
- Create or retrieve an embedded Solana wallet.
- Display wallet address, balance, and funding status.
- Open a fiat funding flow through Crossmint.

The v1 implementation should stay focused on:

```text
identity -> session -> wallet -> dashboard -> funding
```

## Key Features

- Google OAuth-based authentication through Better Auth.
- Persistent app sessions handled by Better Auth.
- One embedded Solana wallet per authenticated user.
- Wallet dashboard with address, balance, copy action, and funding state.
- Crossmint on-ramp flow for card-based funding.
- Developer-friendly SDK functions:
  - `initEasyAuth()`
  - `login()`
  - `getWallet()`
  - `fundWallet()`

## Example Integration

```ts
import { initEasyAuth } from "@easyauth/frontend";

const easyAuth = initEasyAuth({
  apiBaseUrl: "/api/easyauth",
});

await easyAuth.login();

const wallet = await easyAuth.getWallet();

await easyAuth.fundWallet({
  amount: 50,
  currency: "USD",
});
```

## Demo Flow

1. User signs in with Google.
2. Better Auth creates or resumes the app session.
3. EasyAuth creates or retrieves the user's Crossmint Solana wallet.
4. The dashboard displays the wallet address and balance.
5. User clicks fund wallet.
6. Crossmint checkout opens.
7. EasyAuth tracks payment and delivery status.
8. The dashboard updates from pending to funded, failed, or cancelled.

## Tech Stack

- Frontend: SvelteKit and Tailwind CSS for the first-class SDK UI.
- Backend: Node.js with Fastify for the first-class backend integration.
- Auth: Better Auth with Google OAuth.
- Wallet infrastructure: Crossmint embedded wallets.
- Funding: Crossmint on-ramp.
- Blockchain: Solana.
- Database: PostgreSQL-compatible relational database.

## Architecture Notes

Better Auth should own users, OAuth accounts, verification records, and sessions. EasyAuth should only store product-specific wallet, funding, and webhook data.

Crossmint should own wallet custody and on-ramp payment execution. EasyAuth stores provider references and state, not private keys.

EasyAuth should implement Svelte and Fastify first, then document React and Express examples for users who want to adapt the SDK into other stacks.

This repository is focused on the SDK packages first:

- `@easyauth/shared`
- `@easyauth/frontend`
- `@easyauth/backend`

A future `web/` folder may provide simple frontend integration pages after the SDK is stable enough to document.

To find schema decisions visit [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
To find project structure decisions visit [structure.md](file:///C:/Hackathons/EasyAuth/structure.md).
To find SDK package source visit [packages](file:///C:/Hackathons/EasyAuth/packages/README.md).
To find example applications visit [examples](file:///C:/Hackathons/EasyAuth/examples/README.md).
To find frontend API client logic visit [packages/frontend/src/api-client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/api-client.ts).
To find public frontend SDK client logic visit [packages/frontend/src/client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/client.ts).
The auth system can be found in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The wallet connection can be found in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The funding connection can be found in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The SDK package connection can be found in [packages](file:///C:/Hackathons/EasyAuth/packages/README.md).

## v1 Scope

Included:

- OAuth login.
- Session persistence.
- Embedded wallet provisioning.
- Wallet dashboard.
- Fiat funding.
- Funding status tracking.

Excluded:

- Agent wallets.
- Automated transaction execution.
- Smart permissions.
- Multi-chain support.
- Full analytics.
- Phone OTP.

## Roadmap

- Agent-based wallet permissions.
- Automated transaction execution.
- Multi-chain support.
- Developer dashboard.
- Advanced funding and wallet analytics.

## License

MIT
