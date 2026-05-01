# Backend Handlers

This folder contains framework-neutral route handlers for the EasyAuth backend route contract.

## Architectural Decisions

Handlers return plain response objects so framework wrappers can decide how to send them.

Tradeoff:

- Benefit: Fastify, Express, SvelteKit server routes, or other hosts can adapt the same core behavior.
- Cost: each framework needs a small translation layer.

## Source Map

To find session route logic visit [session-handler.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/session-handler.ts).
To find wallet route logic visit [wallet-handler.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/wallet-handler.ts).
To find funding route logic visit [funding-handler.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/funding-handler.ts).
To find webhook route logic visit [webhook-handler.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/webhook-handler.ts).
To find response shaping logic visit [response.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/response.ts).
To find shared request body validation logic visit [../validation.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/validation.ts).
The backend handler connection can be found in [../integrations/fastify.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/fastify.ts).
