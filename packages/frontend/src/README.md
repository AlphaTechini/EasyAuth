# Frontend Source

This folder contains browser-safe SDK source code for EasyAuth.

## Architectural Decisions

The frontend source starts as a package entrypoint and will grow into client APIs, Svelte UI exports, theme primitives, and event handling as the v1 flow is implemented.

Tradeoff:

- Benefit: the public browser API can be reviewed before provider-specific behavior is added.
- Cost: early package builds are skeletal until the v1 contracts are implemented.

## Source Map

To find the frontend SDK entrypoint visit [index.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/index.ts).
To find the API request logic visit [api-client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/api-client.ts).
To find the public `initEasyAuth` client logic visit [client.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/client.ts).
To find SDK event subscription logic visit [events.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/events.ts).
To find frontend snapshot state logic visit [snapshot.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/snapshot.ts).
To find frontend theme primitives visit [theme.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/theme.ts).
To find frontend public TypeScript types visit [types.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/types.ts).
To find Svelte UI components visit [components](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/README.md).
To find default component styling visit [styles](file:///C:/Hackathons/EasyAuth/packages/frontend/src/styles/README.md).
To find Svelte provider context logic visit [ui-context.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/ui-context.ts).
To find Svelte theme style serialization visit [ui-style.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/ui-style.ts).
The frontend package connection can be found in [../package.json](file:///C:/Hackathons/EasyAuth/packages/frontend/package.json).
