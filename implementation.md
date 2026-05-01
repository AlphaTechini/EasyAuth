# EasyAuth Implementation Guide

## Purpose

This file describes how EasyAuth should be implemented step by step. It does not replace [Plan.md](file:///C:/Hackathons/EasyAuth/Plan.md), which tracks the broader product plan.

The current implementation direction is SDK-first. EasyAuth should start as reusable TypeScript SDK packages before committing to a specific SQL library, ORM, database adapter, or host app implementation.

## Implementation Principle

Build the public SDK contracts first, then build adapters around them.

This keeps EasyAuth from becoming tightly coupled to Drizzle, Prisma, Supabase, Fastify, SvelteKit, or any single persistence approach before the SDK APIs have proven themselves.

EasyAuth should be split into three scoped npm packages:

- `@easyauth/frontend`: browser-safe APIs plus customizable frontend modals, cards, and connection UI.
- `@easyauth/backend`: server-only wallet, funding, webhook, storage, and route-handler utilities.
- `@easyauth/shared`: browser-safe and server-safe shared contracts.

The primary implementation stack is Svelte for frontend UI and Fastify for backend integration. The documentation can include examples for other frameworks, especially React on the frontend and Express on the backend, but those should not drive the first implementation.

The frontend SDK may expose Svelte UI models and components that users can theme or wrap without breaking behavior. The backend SDK should expose framework-neutral handlers and service functions, with Fastify as the first supported integration path.

To find the broad project plan visit [Plan.md](file:///C:/Hackathons/EasyAuth/Plan.md).
To find persistence and schema references visit [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
The SDK implementation direction can be found in [implementation.md](file:///C:/Hackathons/EasyAuth/implementation.md).

## Part One: Package Strategy

Main theme: define the package boundaries before writing SDK code.

Sub-tasks:

- Create a workspace-oriented package layout.
- Start with three SDK packages:
  - shared SDK contracts
  - frontend SDK
  - backend SDK
- Keep the future `web/` integration pages out of the initial SDK implementation.
- Keep demo applications separate from the SDK packages.
- Publish SDK packages to npm when stable enough for external installs.
- Treat GitHub installs as a temporary development path, not the normal consumer path.
- Treat Svelte and Fastify as the first implementation targets.
- Treat React and Express as documentation examples until there is a concrete reason to build dedicated adapters.

Implementation notes:

- The normal developer experience should eventually be `pnpm add` or `npm install` from npm.
- Package names should be chosen carefully before publishing because npm package names become part of the product API.
- The future `web/` folder should document integration after the SDK exists, but the SDK packages should not depend on it.
- The SDK packages should not depend on the demo app.
- Framework support should grow from real integration demand, not from trying to cover every ecosystem at once.

## Part Two: Svelte Frontend SDK

Main theme: expose the browser-safe EasyAuth API and themeable Svelte frontend UI.

Sub-tasks:

- Define the public API:
  - `initEasyAuth(config)`
  - `login()`
  - `getSession()`
  - `getWallet()`
  - `fundWallet()`
  - `on(event, handler)` or a similarly small event subscription API.
- Define frontend-safe TypeScript types:
  - `EasyAuthConfig`
  - `EasyAuthFrontendClient`
  - `EasyAuthSession`
  - `EasyAuthUser`
  - `EasyAuthWallet`
  - `FundingRequest`
  - `FundingStatus`
  - `EasyAuthError`
- Expose themeable UI pieces:
  - login/connect modal
  - wallet card
  - fund wallet card
  - funding status card
  - provider/error states
- Expose theming primitives:
  - theme tokens
  - class overrides
  - component slots or render overrides where practical
- Keep browser code free of server secrets.
- Keep dependencies minimal.

Implementation notes:

- The frontend SDK should not create wallets directly with provider API keys.
- The frontend SDK should call backend SDK routes or host-provided endpoints for server-only work.
- Theme customization should not require changing core auth, wallet, or funding behavior.
- Svelte is the first implementation framework.
- React should be covered through documentation examples first, not a dedicated React package.

## Part Three: Fastify Backend SDK

Main theme: expose server-only EasyAuth behavior with Fastify as the first integration while keeping core handlers framework-neutral.

Sub-tasks:

- Define server-side public APIs:
  - create or retrieve wallet
  - create funding order
  - get funding status
  - verify webhook
  - process webhook
  - read current session through the configured auth adapter
- Define adapter contracts:
  - `AuthAdapter`
  - `WalletAdapter`
  - `FundingAdapter`
  - `StorageAdapter`
- Define framework-neutral handler functions.
- Provide Fastify route registration helpers around those framework-neutral handlers.
- Define a consistent error model.
- Define status mappings for auth, wallet creation, and funding.
- Provide an in-memory storage adapter for local development and demos.

Implementation notes:

- The backend SDK may contain provider adapters because it runs server-side.
- The backend SDK must not assume Drizzle, Prisma, Supabase, or raw `pg`.
- The backend SDK should expose functions that frameworks can wrap, with Fastify helpers implemented first.
- The in-memory adapter is supported for local development and demos, not production.
- Express should be covered through documentation examples first, not a dedicated Express adapter.

## Part Four: Provider Adapters

Main theme: connect the SDK contract to real services without leaking provider-specific behavior through the public API.

Sub-tasks:

- Implement a Better Auth-compatible auth adapter.
- Implement a Crossmint wallet adapter.
- Implement a Crossmint funding adapter.
- Map provider responses into EasyAuth-owned types.
- Validate config without exposing secrets in client bundles.
- Separate browser-safe methods from server-only methods.

Browser-safe responsibilities:

- Start login.
- Read current session through a safe endpoint or adapter.
- Display wallet state returned by the host app.
- Open checkout or receive checkout metadata.

Server-only responsibilities:

- Use provider API keys.
- Create or retrieve wallets.
- Create funding orders.
- Verify and process webhooks.
- Persist wallet and funding state through a storage adapter.

Implementation notes:

- Crossmint and Better Auth should remain replaceable.
- Mentions of "BetaAuth" in planning should be treated as Better Auth unless the project deliberately creates a differently named EasyAuth-owned auth layer later.
- Provider API keys must never be accepted by browser-side SDK code.
- Provider errors should be normalized before reaching app UI code.
- Better Auth is used for now because it handles app sessions, OAuth account linking, cookies, and future auth methods behind a maintained abstraction. Direct Google OAuth remains possible, but it would push more session and account-linking responsibility into EasyAuth.

## Part Five: Server Integration Contract

Main theme: define backend integration behavior without choosing Drizzle or any specific SQL library yet.

Sub-tasks:

- Define recommended route contracts:
  - `GET /session`
  - `GET /wallet`
  - `POST /wallet`
  - `POST /funding/orders`
  - `GET /funding/:id`
  - `POST /webhooks/crossmint`
- Define storage adapter methods:
  - `getWalletByUserId`
  - `saveWallet`
  - `createFundingTransaction`
  - `updateFundingTransaction`
  - `recordWebhookEvent`
  - `getFundingTransaction`
- Expose framework-neutral handler functions that host frameworks can adapt into their own routing systems.
- Provide Fastify helper functions as the main implemented backend path.
- Keep database-backed storage as a later adapter.

Implementation notes:

- The server contract should make persistence replaceable.
- The schema remains useful as a reference for durable storage, but it should not force the SDK to depend on a database.
- Webhook processing must be idempotent.
- Funding status updates should be webhook-driven only.
- The SDK should not implement polling as the primary funding-status mechanism.

## Part Six: Framework Examples

Main theme: document how other frameworks can consume the Svelte/Fastify-first SDK surface.

Sub-tasks:

- Write React frontend examples that call the same frontend-safe API or host endpoints.
- Write Express backend examples that adapt the framework-neutral handlers.
- Explain what is first-class implementation versus guide-level support.
- Keep examples small enough to copy into host apps.

Implementation notes:

- Svelte UI components are first-class.
- React examples should not require maintaining a separate React UI package in v1.
- Fastify helpers are first-class.
- Express examples should not require maintaining a separate Express package in v1.

## Part Seven: Web Integration Pages

Main theme: provide simple frontend pages that explain installation, setup, theming, and backend integration clearly enough that developers can use EasyAuth without reading the source.

Sub-tasks:

- Document npm installation.
- Document Svelte frontend SDK setup.
- Document Fastify backend SDK setup.
- Document Better Auth configuration.
- Document Crossmint configuration.
- Document theme customization for modals and cards.
- Document framework-neutral route handlers.
- Document React usage examples.
- Document Express usage examples.
- Document local development with the in-memory adapter.
- Document webhook setup for funding status.

Implementation notes:

- The `web/` folder can be built later with the user's chosen theme.
- The `web/` folder should be the main frontend experience in this repository if the SDK packages remain the primary product.
- The `web/` folder should present EasyAuth the same way a real consumer would install and use the published SDK.

## Part Eight: Demo App

Main theme: prove the SDK works end to end.

Sub-tasks:

- Build a SvelteKit demo app.
- Build a Fastify backend.
- Wire Better Auth Google login.
- Wire Crossmint wallet creation.
- Wire Crossmint funding order creation.
- Display wallet address, balance, and funding state.
- Handle loading, pending, funded, failed, cancelled, and retry states.
- Receive funding status changes through webhooks.

Implementation notes:

- The demo app may use the in-memory storage adapter first.
- Durable Postgres storage should be added only after the SDK and server contracts are stable.
- The demo app should not redefine the SDK's public API.
- The demo app can live separately and consume the SDK like an external application.

## Part Nine: Persistence Adapter Decision

Main theme: choose durable persistence after the SDK contract is stable.

Sub-tasks:

- Revisit [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
- Decide whether the first durable adapter should use:
  - raw `pg`
  - Drizzle
  - Prisma
  - Supabase client
  - a custom user-provided adapter only
- Add migrations only when the demo app needs durable state.
- Keep schema decisions outside the SDK core.

Implementation notes:

- Drizzle is still a valid future option.
- It should not be introduced before the SDK boundaries are clear.
- The SDK should work even if a host app uses a different persistence layer.

## Initial Implementation Order

1. Create the package structure for frontend SDK and backend SDK.
2. Define shared public types that both packages can use.
3. Implement the Svelte frontend SDK client and themeable UI with mock backend endpoints.
4. Implement the Fastify backend SDK service layer with mock provider adapters.
5. Add in-memory storage for local development and demos.
6. Add Better Auth and Crossmint adapters behind backend interfaces.
7. Add framework-neutral route handlers plus Fastify helpers.
8. Build the `web/` integration pages for installation, setup, and theming.
9. Add React and Express examples to the docs.
10. Build the demo app on top of the SDK.
11. Revisit durable persistence and schema implementation.

## Open Architectural Questions

These need discussion before implementation begins:

- What should the first package versions be when the npm packages are ready to publish?
- Should `login()` redirect through Better Auth directly or call a host-provided auth endpoint that uses Better Auth behind the scenes?
- What should the first theming API look like: CSS variables, Tailwind class overrides, component slots, or a mix?

## Guardrails

- Do not store private keys.
- Do not hardcode secrets or config values.
- Do not add Drizzle, Prisma, or another SQL library until persistence strategy is explicitly chosen.
- Do not make Crossmint or Better Auth types part of the stable public SDK API.
- Do not build the demo app before the SDK contract exists.
- Do not add phone OTP, agent wallets, multi-chain support, analytics, or transaction indexing in v1.
- Do not use polling for funding status as the primary update path.
