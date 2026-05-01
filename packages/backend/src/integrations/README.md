# Backend Integrations

This folder contains framework integration helpers for the backend SDK.

## Architectural Decisions

Fastify support is currently structural and dependency-light. The SDK does not add Fastify as a package dependency yet.

Tradeoff:

- Benefit: the SDK remains lightweight while the route contract stabilizes.
- Cost: consumers do not get full Fastify type precision until a dedicated typed adapter is added.

## Source Map

To find Fastify route registration logic visit [fastify.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/fastify.ts).
To find Better Auth route passthrough logic visit [fastify.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/fastify.ts).
The backend integration connection can be found in [../handlers/index.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/index.ts).
