# @easyauth/shared

This package contains browser-safe and server-safe contracts shared by the EasyAuth frontend and backend SDK packages.

## Architectural Decisions

Shared code is limited to types, constants, and pure utilities that do not depend on browser APIs, server APIs, provider secrets, or framework runtimes.

Tradeoff:

- Benefit: frontend and backend packages can agree on stable public contracts.
- Cost: this package must stay conservative so it does not become a hidden runtime dependency bucket.

## Source Map

To find the shared package entrypoint visit [src/index.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/index.ts).
To find shared constants visit [src/constants.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/constants.ts).
To find shared error contracts visit [src/errors.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/errors.ts).
To find shared SDK models visit [src/models.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/models.ts).
To find shared route contracts visit [src/routes.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/routes.ts).
The shared package configuration can be found in [package.json](file:///C:/Hackathons/EasyAuth/packages/shared/package.json).
The shared TypeScript connection can be found in [tsconfig.json](file:///C:/Hackathons/EasyAuth/packages/shared/tsconfig.json).
