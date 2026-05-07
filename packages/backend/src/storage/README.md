# Backend Storage

This folder contains storage adapter implementations for the backend SDK.

## Architectural Decisions

The first storage implementation is in-memory and intended for local development, demos, and SDK contract validation only. Durable storage uses raw Postgres through `pg` so production apps can use standard Postgres or Supabase Postgres without adopting an ORM.

Tradeoff:

- Benefit: backend behavior can be exercised before choosing Drizzle, Prisma, raw `pg`, or another durable adapter.
- Cost: in-memory storage is not durable and must not be used as production persistence.

The Postgres adapter does not auto-run schema changes unless the host explicitly passes `runMigrations: true`.

Tradeoff:

- Benefit: production hosts keep control over database migrations and permissions.
- Cost: consumers must run the schema SQL before using durable storage.

## Source Map

To find in-memory storage logic visit [memory-storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/memory-storage.ts).
To find the in-memory storage export surface visit [memory.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/memory.ts).
To find Postgres storage logic visit [postgres-storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres-storage.ts).
To find Postgres schema SQL visit [postgres-schema.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres-schema.ts).
To find the Postgres storage export surface visit [postgres.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/postgres.ts).
The backend storage connection can be found in [../adapters/storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/storage.ts).
