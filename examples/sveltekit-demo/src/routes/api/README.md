# API Routes

This folder contains the SvelteKit backend surface used by the deployed demo app.

## Architectural Decisions

The demo uses one catch-all API gateway route to map `/api/*` requests into Better Auth and EasyAuth SDK handlers.

Tradeoff:

- Benefit: Vercel deployment only needs the SvelteKit app; no separate Fastify service is required for the demo video.
- Cost: this route is intentionally a demo adapter, not a published SDK integration.

## Source Map

To find API gateway route logic visit [[...path]/+server.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/routes/api/[...path]/+server.js).
To find backend dispatch logic visit [../../lib/server/sveltekit-api.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/sveltekit-api.js).
The demo API connection can be found in [../../lib/server/demo-backend.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/demo-backend.js).
