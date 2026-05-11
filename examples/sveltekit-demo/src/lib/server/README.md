# Server Library

This folder contains the server-only bridge between SvelteKit routes and the EasyAuth SDK.

## Architectural Decisions

The demo initializes Better Auth and the EasyAuth backend SDK from environment variables, then exposes route helpers consumed by `src/routes/api/[...path]/+server.js`.

Tradeoff:

- Benefit: deployed Vercel requests hit SvelteKit server routes directly, so the demo no longer depends on a separate Fastify process.
- Cost: Fastify-specific integration behavior is shown by `server/index.js`, while the deployed demo uses the framework-neutral SDK handlers.

Postgres is used when `DATABASE_URL` is present. In-memory adapters remain as a local fallback only.

Tradeoff:

- Benefit: local demos can start without infrastructure.
- Cost: deployed OAuth/session/wallet history should use durable Postgres storage because serverless memory is not stable across invocations.

## Source Map

To find backend initialization logic visit [demo-backend.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/demo-backend.js).
To find SvelteKit API dispatch logic visit [sveltekit-api.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/sveltekit-api.js).
To find request input mapping visit [sveltekit-input.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/sveltekit-input.js).
To find response serialization visit [sveltekit-response.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/sveltekit-response.js).
The Better Auth connection can be found in [demo-backend.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/demo-backend.js).
The EasyAuth backend SDK connection can be found in [demo-backend.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/demo-backend.js).
