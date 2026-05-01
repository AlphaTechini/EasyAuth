# Frontend Components

This folder contains the themeable Svelte UI pieces exposed by `@easyauth/frontend`.

## Architectural Decisions

The components are published as Svelte source files through package subpath exports. Shared runtime helpers are imported from the built package output so npm consumers receive stable JavaScript modules while Svelte still compiles the component source inside the host app.

Components expose named slots for practical render overrides while retaining prop-driven fallback UI.

Tradeoff:

- Benefit: consumers can theme and compile the components naturally in Svelte and SvelteKit apps.
- Benefit: consumers can replace key regions such as headers, actions, errors, empty states, and status bodies without forking the component.
- Cost: package builds must run before publishing so `dist` helper modules exist for component imports.

## Source Map

To find provider context UI logic visit [EasyAuthProvider.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/EasyAuthProvider.svelte).
To find login and connect modal logic visit [LoginConnectModal.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/LoginConnectModal.svelte).
To find wallet display logic visit [WalletCard.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/WalletCard.svelte).
To find funding form logic visit [FundWalletCard.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/FundWalletCard.svelte).
To find embedded checkout rendering logic visit [EmbeddedCheckout.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/EmbeddedCheckout.svelte).
To find funding status display logic visit [FundingStatusCard.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/FundingStatusCard.svelte).
To find identity and error state display logic visit [EasyAuthState.svelte](file:///C:/Hackathons/EasyAuth/packages/frontend/src/components/EasyAuthState.svelte).
The frontend component connection can be found in [../index.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/index.ts).
