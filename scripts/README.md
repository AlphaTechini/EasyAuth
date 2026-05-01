# Verification Scripts

This folder contains lightweight verification helpers for the SDK workspace.

## Architectural Decisions

The scripts check package builds, TypeScript, Svelte component compilation, and dependency audit results without adding unit or end-to-end tests.

Tradeoff:

- Benefit: each implementation stage can be validated quickly before moving on.
- Cost: these checks prove compile and package health, not runtime behavior in a real app.

## Source Map

To find staged verification logic visit [verify.mjs](file:///C:/Hackathons/EasyAuth/scripts/verify.mjs).
To find Svelte component compilation logic visit [check-svelte.mjs](file:///C:/Hackathons/EasyAuth/scripts/check-svelte.mjs).
The root package script connection can be found in [../package.json](file:///C:/Hackathons/EasyAuth/package.json).
