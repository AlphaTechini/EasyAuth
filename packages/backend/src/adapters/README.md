# Backend Adapters

This folder defines provider and persistence contracts for the backend SDK.

## Architectural Decisions

EasyAuth keeps Better Auth, Crossmint, and persistence details behind interfaces instead of exposing provider-specific types as stable SDK API.

Tradeoff:

- Benefit: provider implementations can change without reshaping the public backend SDK.
- Cost: adapter authors must map provider responses into EasyAuth-owned types.

## Source Map

To find auth adapter logic visit [auth.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/auth.ts).
To find the Better Auth session adapter visit [better-auth.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/better-auth.ts).
To find the Crossmint adapter export surface visit [crossmint.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/crossmint.ts).
To find wallet adapter logic visit [wallet.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/wallet.ts).
To find the Crossmint wallet adapter visit [crossmint-wallet.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/crossmint-wallet.ts).
To find funding adapter logic visit [funding.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/funding.ts).
To find the Crossmint funding and webhook adapter visit [crossmint-funding.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/crossmint-funding.ts).
To find shared Crossmint HTTP request logic visit [crossmint-http.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/crossmint-http.ts).
To find storage adapter logic visit [storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/storage.ts).
The backend adapter connection can be found in [../config.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/config.ts).
