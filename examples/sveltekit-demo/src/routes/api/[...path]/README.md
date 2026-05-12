# API Gateway Route

This folder contains the catch-all SvelteKit route for `/api/*`.

## Architectural Decisions

The route file delegates all logic to `src/lib/server` so the route remains a framework adapter instead of a monolithic backend implementation.

Tradeoff:

- Benefit: route matching stays small and the SDK-facing logic can be inspected independently.
- Cost: SvelteKit's catch-all path is less visually explicit than one folder per endpoint.

## Source Map

To find route entry logic visit [+server.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/routes/api/[...path]/+server.js).
To find API dispatch logic visit [../../../lib/server/sveltekit-api.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/sveltekit-api.js).
The catch-all route connection can be found in [../../../lib/server/sveltekit-api.js](file:///C:/Hackathons/EasyAuth/examples/sveltekit-demo/src/lib/server/sveltekit-api.js).
