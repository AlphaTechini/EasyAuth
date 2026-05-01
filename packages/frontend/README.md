# @easyauth/frontend

This package will expose the browser-safe EasyAuth client APIs and the first-class Svelte UI pieces.

## Architectural Decisions

The frontend SDK is responsible for browser-safe integration only. It must call host backend routes for server-only operations such as wallet creation, funding order creation, webhook handling, provider API calls, and session verification that requires secrets.

Tradeoff:

- Benefit: secrets and provider credentials stay out of browser bundles.
- Cost: frontend consumers need a compatible backend integration for complete EasyAuth behavior.

Svelte UI components are exposed through subpath exports so consumers can import only the pieces they need.

Tradeoff:

- Benefit: the API client and UI pieces can evolve without forcing every consumer into the same UI composition.
- Cost: publish builds must include both `dist` helpers and Svelte source files.

## Source Map

To find the frontend package entrypoint visit [src/index.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/index.ts).
To find the frontend API client visit [src/api-client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/api-client.ts).
To find the public frontend SDK client visit [src/client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/client.ts).
To find frontend event handling visit [src/events.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/events.ts).
To find frontend snapshot state types visit [src/snapshot.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/snapshot.ts).
To find frontend theme primitives visit [src/theme.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/theme.ts).
To find frontend public TypeScript types visit [src/types.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/types.ts).
To find Svelte UI components visit [src/components](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/README.md).
To find default component styling visit [src/styles](file:///C:/Hackathons/EasyAuth/packages/frontend/src/styles/README.md).
The frontend package configuration can be found in [package.json](file:///C:/Hackathons/EasyAuth/packages/frontend/package.json).
The frontend TypeScript connection can be found in [tsconfig.json](file:///C:/Hackathons/EasyAuth/packages/frontend/tsconfig.json).

## Svelte Exports

- `@easyauth/frontend/svelte/provider`
- `@easyauth/frontend/svelte/login-connect-modal`
- `@easyauth/frontend/svelte/wallet-card`
- `@easyauth/frontend/svelte/fund-wallet-card`
- `@easyauth/frontend/svelte/embedded-checkout`
- `@easyauth/frontend/svelte/funding-status-card`
- `@easyauth/frontend/svelte/state`
- `@easyauth/frontend/styles.css`

## Embedded Checkout

The embedded checkout component keeps the EasyAuth shell in Svelte and mounts Crossmint's official embedded checkout UI at runtime when the host app provides the optional Crossmint React UI package.

Tradeoff:

- Benefit: the primary user flow stays in-app instead of redirecting users away from the host application.
- Cost: hosts that render embedded Crossmint checkout must install and bundle Crossmint's React UI dependency in their application.

To find embedded checkout UI logic visit [src/components/EmbeddedCheckout.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/EmbeddedCheckout.svelte).
The embedded checkout contract can be found in [../shared/src/models.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/models.ts).
