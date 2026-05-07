# @easyauth/backend

This package will expose server-only EasyAuth services, provider adapters, storage adapters, webhook utilities, and Fastify integration helpers.

## Architectural Decisions

The backend SDK owns server-only behavior. It is the package that can interact with Better Auth, Crossmint, database adapters, webhook secrets, and other private configuration loaded from the host application's environment.

Tradeoff:

- Benefit: security-sensitive logic stays behind server boundaries.
- Cost: backend users must configure provider credentials and storage correctly in their host application.

The backend SDK starts with framework-neutral services and handlers before framework-specific route helpers.

Tradeoff:

- Benefit: the same backend behavior can be adapted into Fastify or other frameworks later.
- Cost: the first Fastify integration is a thin structural wrapper instead of a hard dependency on Fastify types.

## Source Map

To find the backend package entrypoint visit [src/index.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/index.ts).
To find backend adapter contracts and provider adapters visit [src/adapters](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/README.md).
To find backend service logic visit [src/services](file:///C:/Hackathons/EasyAuth/packages/backend/src/services/README.md).
To find backend route handlers visit [src/handlers](file:///C:/Hackathons/EasyAuth/packages/backend/src/handlers/README.md).
To find backend Fastify integration logic visit [src/integrations](file:///C:/Hackathons/EasyAuth/packages/backend/src/integrations/README.md).
To find backend storage implementations visit [src/storage](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/README.md).
To find durable Postgres storage logic visit [src/storage/postgres-storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres-storage.ts).
To find durable Postgres schema SQL visit [src/storage/postgres-schema.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres-schema.ts).
The backend package configuration can be found in [package.json](file:///C:/Hackathons/EasyAuth/packages/backend/package.json).
The backend TypeScript connection can be found in [tsconfig.json](file:///C:/Hackathons/EasyAuth/packages/backend/tsconfig.json).

## Curated Exports

- `@easyauth/backend`
- `@easyauth/backend/adapters/better-auth`
- `@easyauth/backend/adapters/crossmint`
- `@easyauth/backend/handlers`
- `@easyauth/backend/integrations/fastify`
- `@easyauth/backend/storage/memory`
- `@easyauth/backend/storage/postgres`

To find curated backend export configuration visit [package.json](file:///C:/Hackathons/EasyAuth/packages/backend/package.json).
