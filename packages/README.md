# EasyAuth Packages

This folder contains the publishable SDK packages for EasyAuth.

## Architectural Decisions

EasyAuth uses separate scoped packages so browser-safe code, server-only behavior, and shared contracts do not blur together.

Tradeoff:

- Benefit: package consumers can install only the SDK surface they need.
- Cost: shared type changes must be coordinated across package versions.

## Package Map

- The shared SDK contracts can be found in [shared](file:///C:/Hackathons/EasyAuth/packages/shared/README.md).
- The frontend SDK can be found in [frontend](file:///C:/Hackathons/EasyAuth/packages/frontend/README.md).
- The backend SDK can be found in [backend](file:///C:/Hackathons/EasyAuth/packages/backend/README.md).

To find package workspace logic visit [pnpm-workspace.yaml](file:///C:/Hackathons/EasyAuth/pnpm-workspace.yaml).
The TypeScript build connection can be found in [tsconfig.base.json](file:///C:/Hackathons/EasyAuth/tsconfig.base.json).
