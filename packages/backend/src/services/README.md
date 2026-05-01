# Backend Services

This folder contains framework-neutral backend service logic for sessions, wallets, funding, and webhooks.

## Architectural Decisions

Services depend on adapter contracts and storage, not on Fastify, databases, or provider SDKs directly.

Tradeoff:

- Benefit: service behavior can be reused by any server framework.
- Cost: framework integration must translate requests into service inputs.

## Source Map

To find session service logic visit [session-service.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/session-service.ts).
To find wallet service logic visit [wallet-service.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/wallet-service.ts).
To find funding service logic visit [funding-service.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/funding-service.ts).
To find webhook service logic visit [webhook-service.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/webhook-service.ts).
To find backend request validation used by services visit [../validation.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/validation.ts).
The backend service connection can be found in [../config.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/config.ts).
