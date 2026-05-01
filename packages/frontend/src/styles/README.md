# Frontend Styles

This folder contains the default EasyAuth UI stylesheet.

## Architectural Decisions

The default theme is intentionally neutral: white surfaces, black primary actions, readable muted text, and simple borders. Host apps can override CSS variables or pass theme tokens and class overrides through the SDK.

Tradeoff:

- Benefit: the default UI fits most sites without competing with a product's brand system.
- Cost: the default visual design is intentionally plain until a host app customizes it.

## Source Map

To find default component styling visit [easyauth.css](file:///C:/Hackathons/EasyAuth/packages/frontend/src/styles/easyauth.css).
The frontend style connection can be found in [../theme.ts](file:///C:/Hackathons/EasyAuth/packages/frontend/src/theme.ts).
