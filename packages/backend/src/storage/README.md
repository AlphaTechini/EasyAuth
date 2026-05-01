# Backend Storage

This folder contains storage adapter implementations for the backend SDK.

## Architectural Decisions

The first storage implementation is in-memory and intended for local development, demos, and SDK contract validation only.

Tradeoff:

- Benefit: backend behavior can be exercised before choosing Drizzle, Prisma, raw `pg`, or another durable adapter.
- Cost: in-memory storage is not durable and must not be used as production persistence.

## Source Map

To find in-memory storage logic visit [memory-storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/storage/memory-storage.ts).
The backend storage connection can be found in [../adapters/storage.ts](file:///C:/Hackathons/EasyAuth/packages/backend/src/adapters/storage.ts).
