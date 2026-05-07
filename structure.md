# EasyAuth Structure

## Current Folder Structure

```text
C:/Hackathons/EasyAuth
|-- .agents/
|   |-- GUIDE.md
|   `-- README.md
|-- packages/
|   |-- backend/
|   |   |-- src/
|   |   |   |-- adapters/
|   |   |   |   |-- auth.ts
|   |   |   |   |-- better-auth.ts
|   |   |   |   |-- crossmint-funding.ts
|   |   |   |   |-- crossmint-http.ts
|   |   |   |   |-- crossmint-wallet.ts
|   |   |   |   |-- crossmint.ts
|   |   |   |   |-- funding.ts
|   |   |   |   |-- README.md
|   |   |   |   |-- storage.ts
|   |   |   |   `-- wallet.ts
|   |   |   |-- config.ts
|   |   |   |-- errors.ts
|   |   |   |-- handlers/
|   |   |   |   |-- funding-handler.ts
|   |   |   |   |-- index.ts
|   |   |   |   |-- README.md
|   |   |   |   |-- response.ts
|   |   |   |   |-- routes.ts
|   |   |   |   |-- session-handler.ts
|   |   |   |   |-- wallet-handler.ts
|   |   |   |   `-- webhook-handler.ts
|   |   |   |-- integrations/
|   |   |   |   |-- fastify.ts
|   |   |   |   `-- README.md
|   |   |   |-- README.md
|   |   |   |-- services/
|   |   |   |   |-- funding-service.ts
|   |   |   |   |-- README.md
|   |   |   |   |-- session-service.ts
|   |   |   |   |-- wallet-service.ts
|   |   |   |   `-- webhook-service.ts
|   |   |   |-- storage/
|   |   |   |   |-- memory.ts
|   |   |   |   |-- memory-storage.ts
|   |   |   |   |-- postgres-schema.ts
|   |   |   |   |-- postgres-storage.ts
|   |   |   |   |-- postgres.ts
|   |   |   |   `-- README.md
|   |   |   |-- types.ts
|   |   |   |-- validation.ts
|   |   |   `-- index.ts
|   |   |-- package.json
|   |   |-- README.md
|   |   `-- tsconfig.json
|   |-- frontend/
|   |   |-- src/
|   |   |   |-- api-client.ts
|   |   |   |-- client.ts
|   |   |   |-- components/
|   |   |   |   |-- EmbeddedCheckout.svelte
|   |   |   |   |-- EasyAuthProvider.svelte
|   |   |   |   |-- EasyAuthState.svelte
|   |   |   |   |-- FundWalletCard.svelte
|   |   |   |   |-- FundingStatusCard.svelte
|   |   |   |   |-- LoginConnectModal.svelte
|   |   |   |   |-- README.md
|   |   |   |   `-- WalletCard.svelte
|   |   |   |-- events.ts
|   |   |   |-- README.md
|   |   |   |-- snapshot.ts
|   |   |   |-- styles/
|   |   |   |   |-- easyauth.css
|   |   |   |   `-- README.md
|   |   |   |-- theme.ts
|   |   |   |-- types.ts
|   |   |   |-- ui-context.ts
|   |   |   |-- ui-style.ts
|   |   |   `-- index.ts
|   |   |-- package.json
|   |   |-- README.md
|   |   `-- tsconfig.json
|   |-- shared/
|   |   |-- src/
|   |   |   |-- constants.ts
|   |   |   |-- errors.ts
|   |   |   |-- README.md
|   |   |   |-- models.ts
|   |   |   |-- routes.ts
|   |   |   `-- index.ts
|   |   |-- package.json
|   |   |-- README.md
|   |   `-- tsconfig.json
|   `-- README.md
|-- .gitignore
|-- Plan.md
|-- package.json
|-- pnpm-workspace.yaml
|-- README.md
|-- Resources.md
|-- scripts/
|   |-- check-svelte.mjs
|   |-- README.md
|   `-- verify.mjs
|-- Schema.md
|-- implementation.md
|-- tsconfig.base.json
`-- structure.md
```

## Logic Map

- Product overview and MVP boundaries live in [README.md](file:///C:/Hackathons/EasyAuth/README.md).
- Secret and local artifact exclusions live in [.gitignore](file:///C:/Hackathons/EasyAuth/.gitignore).
- Database and provider state modeling live in [Schema.md](file:///C:/Hackathons/EasyAuth/Schema.md).
- SDK implementation sequencing lives in [implementation.md](file:///C:/Hackathons/EasyAuth/implementation.md).
- Research links and provider references live in [Resources.md](file:///C:/Hackathons/EasyAuth/Resources.md).
- Implementation planning lives in [Plan.md](file:///C:/Hackathons/EasyAuth/Plan.md).
- Persistent agent-facing project decisions live in [.agents/GUIDE.md](file:///C:/Hackathons/EasyAuth/.agents/GUIDE.md).
- Workspace verification scripts live in [scripts/README.md](file:///C:/Hackathons/EasyAuth/scripts/README.md).
- SDK package boundaries live in [packages/README.md](file:///C:/Hackathons/EasyAuth/packages/README.md).
- Shared SDK contracts live in [packages/shared](file:///C:/Hackathons/EasyAuth/packages/shared/README.md).
- Browser-safe frontend SDK logic lives in [packages/frontend](file:///C:/Hackathons/EasyAuth/packages/frontend/README.md).
- Server-only backend SDK logic lives in [packages/backend](file:///C:/Hackathons/EasyAuth/packages/backend/README.md).
- Backend adapter contracts live in [packages/backend/src/adapters](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/README.md).
- Backend services live in [packages/backend/src/services](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/README.md).
- Backend route handlers live in [packages/backend/src/handlers](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/README.md).
- Framework-neutral backend route contracts live in [packages/backend/src/handlers/routes.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/routes.ts).
- Backend Fastify integration lives in [packages/backend/src/integrations](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/README.md).
- Backend storage adapters live in [packages/backend/src/storage](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/README.md).
- Durable Postgres storage logic lives in [packages/backend/src/storage/postgres-storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres-storage.ts).
- Frontend API request logic lives in [packages/frontend/src/api-client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/api-client.ts).
- Public frontend client logic lives in [packages/frontend/src/client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/client.ts).
- Frontend public TypeScript types live in [packages/frontend/src/types.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/types.ts).
- Frontend theme primitives live in [packages/frontend/src/theme.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/theme.ts).
- Svelte UI components live in [packages/frontend/src/components](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/README.md).
- Default frontend UI styles live in [packages/frontend/src/styles](file:///C:/Hackathons/EasyAuth/packages/frontend/src/styles/README.md).
- Shared route contracts live in [packages/shared/src/routes.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/routes.ts).

## Folder READMEs

- Root project documentation is in [README.md](file:///C:/Hackathons/EasyAuth/README.md).
- Agent memory documentation is in [.agents/README.md](file:///C:/Hackathons/EasyAuth/.agents/README.md).
- Package workspace documentation is in [packages/README.md](file:///C:/Hackathons/EasyAuth/packages/README.md).
- Verification script documentation is in [scripts/README.md](file:///C:/Hackathons/EasyAuth/scripts/README.md).
- Backend SDK documentation is in [packages/backend/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/README.md).
- Backend SDK source documentation is in [packages/backend/src/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/src/README.md).
- Backend adapter documentation is in [packages/backend/src/adapters/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/README.md).
- Backend service documentation is in [packages/backend/src/services/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/README.md).
- Backend handler documentation is in [packages/backend/src/handlers/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/README.md).
- Backend integration documentation is in [packages/backend/src/integrations/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/README.md).
- Backend storage documentation is in [packages/backend/src/storage/README.md](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/README.md).
- Frontend SDK documentation is in [packages/frontend/README.md](file:///C:/Hackathons/EasyAuth/packages/frontend/README.md).
- Frontend SDK source documentation is in [packages/frontend/src/README.md](file:///C:/Hackathons/EasyAuth/packages/frontend/src/README.md).
- Frontend component documentation is in [packages/frontend/src/components/README.md](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/README.md).
- Frontend style documentation is in [packages/frontend/src/styles/README.md](file:///C:/Hackathons/EasyAuth/packages/frontend/src/styles/README.md).
- Shared SDK documentation is in [packages/shared/README.md](file:///C:/Hackathons/EasyAuth/packages/shared/README.md).
- Shared SDK source documentation is in [packages/shared/src/README.md](file:///C:/Hackathons/EasyAuth/packages/shared/src/README.md).

## Architectural Decisions

This repository is now in SDK foundation work. The current structure favors publishable SDK packages before any local demo or `web/` integration surface.

Tradeoff:

- Benefit: SDK package boundaries can be reviewed before auth, wallet, and funding behavior are implemented.
- Cost: visual integration pages arrive later.

To find project structure logic visit [structure.md](file:///C:/Hackathons/EasyAuth/structure.md).
The project documentation connection can be found in [README.md](file:///C:/Hackathons/EasyAuth/README.md).
The SDK package connection can be found in [packages/README.md](file:///C:/Hackathons/EasyAuth/packages/README.md).
