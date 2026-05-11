# SvelteKit Library

This folder contains code shared by the demo app routes.

## Architectural Decisions

Server-only backend wiring lives in `server/` so browser routes do not import secrets, provider adapters, or database clients.

Tradeoff:

- Benefit: the demo can deploy as a single SvelteKit application while still exercising the backend SDK.
- Cost: the demo has a thin SvelteKit adapter layer in addition to the Fastify example server.

## Source Map

To find demo backend wiring visit [server/README.md](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/README.md).
The SvelteKit library connection can be found in [server/README.md](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/README.md).
