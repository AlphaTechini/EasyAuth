# EasyAuth Implementation Plan

## Current Phase

The project is in SDK foundation work. The database, auth, wallet, and funding boundaries are documented, and implementation should keep those boundaries separate as SDK packages take shape.

## Recommended Build Order

1. Scaffold the SDK-only pnpm workspace with scoped packages.
2. Define shared public types and package exports.
3. Implement browser-safe frontend SDK APIs.
4. Implement server-only backend SDK services and adapter contracts.
5. Add framework-neutral route handlers.
6. Add Fastify integration helpers.
7. Add Svelte UI exports for the frontend SDK.
8. Add Better Auth and Crossmint adapters behind backend interfaces.
9. Add in-memory storage for local development and external demos.
10. Add simple `web/` integration pages after the SDK is stable enough to document.

## Architectural Decisions

The project should keep auth/session storage in Better Auth tables and product-specific state in EasyAuth tables.

Tradeoff:

- Benefit: security-sensitive auth behavior stays inside a maintained framework.
- Cost: schema migrations must respect Better Auth's expected table shape.

The repository should prioritize publishable SDK packages over local demo applications.

Tradeoff:

- Benefit: package design stays aligned with real npm consumption.
- Cost: end-to-end visual validation happens later through an external consumer or the future `web/` integration surface.

To find implementation planning logic visit [Plan.md](file:///C:/Hackathons/EasyAuth/Plan.md).
The implementation planning connection can be found in [Plan.md](file:///C:/Hackathons/EasyAuth/Plan.md).
