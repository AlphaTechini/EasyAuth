# Backend Source

This folder contains server-only SDK source code for EasyAuth.

## Architectural Decisions

The backend source starts as a package entrypoint and will grow into framework-neutral services before Fastify-specific route helpers are added.

Tradeoff:

- Benefit: core backend behavior can be tested and reused without depending on Fastify internals.
- Cost: Fastify users receive a thin wrapper around the core services rather than all logic living directly in route handlers.

## Source Map

To find the backend SDK entrypoint visit [index.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/index.ts).
To find backend adapter contracts visit [adapters](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/README.md).
To find backend service logic visit [services](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/README.md).
To find backend route handlers visit [handlers](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/README.md).
To find backend framework integrations visit [integrations](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/README.md).
To find backend storage implementations visit [storage](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/README.md).
To find durable Postgres storage logic visit [storage/postgres-storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres-storage.ts).
To find backend configuration logic visit [config.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/config.ts).
To find backend error logic visit [errors.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/errors.ts).
To find backend request validation logic visit [validation.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/validation.ts).
To find backend public TypeScript types visit [types.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/types.ts).
The backend package connection can be found in [../package.json](file:///C:/Hackathons/EasyAuth/packages/backend/package.json).
