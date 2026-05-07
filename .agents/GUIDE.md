# EasyAuth Agent Guide

## Confirmed Constraints

- Product name is EasyAuth.
- Package manager is pnpm.
- Frontend should use SvelteKit and Tailwind CSS unless explicitly changed.
- Backend should use Node.js with Fastify for this project.
- Auth should use Better Auth with Google OAuth for v1.
- Wallet infrastructure should use Crossmint for embedded Solana wallets.
- Funding should use Crossmint on-ramp.
- Database should be PostgreSQL-compatible.
- EasyAuth should be implemented as separate frontend and backend SDK packages.
- The npm package scope is `@easyauth`.
- The SDK workspace packages are `@easyauth/shared`, `@easyauth/frontend`, and `@easyauth/backend`.
- SDK packages should be publishable to npm.
- This repository should prioritize SDK development before any frontend documentation experience.
- A future `web/` folder may contain simple frontend pages that demonstrate SDK integration, but that should happen after the SDK is developed.
- The future `web/` folder is not a standard documentation site and should not drive SDK architecture.
- Consumer demos should validate the SDK as an npm-installed dependency, even if a local frontend exists later.
- The frontend SDK should expose browser-safe APIs plus themeable modals and cards.
- Frontend public TypeScript contracts should live in `packages/frontend/src/types.ts`.
- Frontend theme primitives should live in `packages/frontend/src/theme.ts`.
- Theming should expose typed tokens, class slots, default neutral tokens, CSS variable serialization, and a `defineEasyAuthTheme` helper.
- Svelte UI components should live in `packages/frontend/src/components`.
- The default UI should stay neutral and easy to override, using black and white defaults instead of strong gradients or brand-heavy colors.
- Svelte UI components are published through frontend package subpath exports and rely on built `dist` helper modules.
- Use `pnpm verify` as the staged health check after each meaningful SDK change. It runs build, typecheck, Svelte component compilation, and dependency audit without adding unit or e2e tests.
- The backend SDK should expose server-only services, provider adapters, storage adapters, and framework-neutral handlers.
- Backend SDK code should keep provider and persistence behavior behind `AuthAdapter`, `WalletAdapter`, `FundingAdapter`, and `StorageAdapter`.
- Backend services should stay framework-neutral and should not depend on Fastify, Crossmint, Better Auth, or a database package directly.
- Fastify support should start as a structural route registration helper while route contracts stabilize.
- In-memory storage is for local development, demos, and SDK contract validation only.
- Durable SDK storage should use the raw `pg` Postgres adapter first, with Supabase supported through a pooler connection string and `sslmode=require`.
- Database schema application should remain explicit; SDK storage adapters must not silently migrate production databases unless the host opts in.
- Backend SDK hardening comes before provider-specific Better Auth and Crossmint adapters.
- Backend services should validate runtime inputs because package consumers can call services directly without route handlers.
- Signed webhook handling should require a raw request body by default so provider signature verification is not based on parsed JSON.
- Unknown backend errors should not serialize raw error objects into API responses.
- Provider adapters should stay dependency-light and avoid exposing Better Auth or Crossmint concrete types as stable public contracts.
- Crossmint funding should support host-provided order body mapping because token locators, checkout mode, and product setup can vary.
- Crossmint webhook verification should use the Svix-compatible `svix-id`, `svix-timestamp`, and `svix-signature` headers.
- Embedded Crossmint checkout is the primary v1 funding UX; hosted checkout is a fallback path only.
- EasyAuth frontend login should call Better Auth's social sign-in endpoint and redirect from the provider response instead of linking to a static login URL.
- The Svelte embedded checkout component should own the EasyAuth shell and mount Crossmint's official UI at runtime through optional host-installed dependencies.
- Fastify hosts should register `registerEasyAuthFastifyRawBody` before EasyAuth webhook routes so Crossmint verification receives the signed raw body.
- Package export maps should expose curated subpaths for common integration surfaces without making every internal file part of the stable public API.
- Server integration route contracts should live in `@easyauth/backend/handlers` and be reused by Fastify instead of duplicating route definitions per framework.
- SDK packages should use `tsup` for TypeScript package builds.
- Svelte is the first-class frontend SDK implementation target.
- Fastify is the first-class backend SDK integration target.
- React frontend examples and Express backend examples belong in documentation, not first-class v1 packages.
- Secrets, API keys, database URLs, OAuth credentials, and webhook secrets must come from `.env`.
- Private keys must never be stored by EasyAuth.
- `.env` must be listed in `.gitignore` before implementation work stores configuration locally.

## Architectural Decisions

### Auth Boundary

Better Auth owns users, OAuth accounts, verification records, and sessions.

Tradeoff:

- This reduces custom security-sensitive code.
- The project must follow Better Auth's generated schema and adapter behavior.

Mentions of "BetaAuth" in planning refer to Better Auth unless the project intentionally creates a renamed EasyAuth-owned auth layer later.

### Wallet Boundary

EasyAuth stores wallet references and one wallet per user. Crossmint owns custody, signing, recovery, and provider wallet behavior.

Tradeoff:

- This keeps the hackathon build realistic and avoids custom crypto custody.
- Provider API behavior becomes part of the product dependency.

### Funding Boundary

EasyAuth tracks funding attempts and webhook events. Crossmint owns checkout, payment handling, KYC, and delivery.

Tradeoff:

- This gives the demo real pending/funded/failed states without building payments infrastructure.
- Some status values must be mapped from provider-specific events.

Funding status updates should be webhook-driven only. Polling should not be used as the primary status update path.

### SDK Boundary

The shared, frontend, and backend SDKs are separate scoped npm packages.

Tradeoff:

- This keeps browser-safe UI and server-only provider behavior clearly separated.
- More package coordination is required when changing shared types.

### Framework Boundary

Svelte and Fastify are the first-class implementation targets. React and Express should be documented as examples that consume the same SDK APIs.

Tradeoff:

- This keeps the initial product focused and easier to polish.
- Users outside Svelte/Fastify get guidance before dedicated package support.

### Publishing Boundary

EasyAuth SDKs should be designed for npm installation.

Tradeoff:

- npm matches normal JavaScript SDK consumption.
- Package names, exports, and semver become long-term product decisions.

### Web Documentation Boundary

The repository may later include a `web/` folder for simple frontend documentation and integration examples.

Tradeoff:

- This gives users a visual way to understand integration after the SDK exists.
- The SDK architecture must stay independent from the `web/` folder so package design is not shaped by a local demo surface.

## Patterns To Follow

- Keep v1 centered on `identity -> session -> wallet -> dashboard -> funding`.
- Keep the frontend API client pointed at host-provided EasyAuth backend endpoints, not provider APIs.
- Default API paths are shared contracts and can be overridden by host applications.
- Use idempotency keys for wallet creation and funding order creation where provider APIs support them.
- Store provider references, not secrets or private keys.
- Use narrow tables for wallet and funding state before adding analytics or transaction history.
- Use framework-neutral backend handler functions before framework-specific wrappers.
- Implement Fastify helpers first.
- Implement Svelte UI first.
- Support the in-memory adapter for local development and demos.
- Add README files for each new folder as source directories are created.
- Keep documentation neutral and practical.
- Treat the future `web/` folder as a consumer-facing integration surface, not as a dependency of the SDK packages.

## Deferred Work

- Agent wallets.
- Multi-chain support.
- Phone OTP.
- Custom custody.
- Full transaction indexing.
- Analytics dashboards.

To find confirmed architecture logic visit [GUIDE.md](file:///C:/Hackathons/EasyAuth/.agents/GUIDE.md).
The project memory connection can be found in [GUIDE.md](file:///C:/Hackathons/EasyAuth/.agents/GUIDE.md).
