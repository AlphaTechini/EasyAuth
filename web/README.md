# EasyAuth Documentation

This folder contains the VitePress documentation site for EasyAuth.

## Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm docs:dev
```

The site will be available at `http://localhost:5173`

## Build

Build the static site:

```bash
pnpm docs:build
```

Preview the built site:

```bash
pnpm docs:preview
```

## Structure

```
docs/
├── .vitepress/
│   ├── config.ts          # Site configuration
│   └── theme/
│       ├── index.ts       # Theme entry
│       └── custom.css     # Custom styles
├── index.md               # Homepage
├── getting-started.md     # Quick start guide
├── frontend/              # Frontend integration guides
│   ├── index.md
│   ├── svelte.md
│   ├── react.md
│   ├── vue.md
│   └── angular.md
├── backend/               # Backend integration guides
│   ├── index.md
│   ├── nodejs.md
│   ├── python.md
│   └── golang.md
├── concepts/              # Core concepts
│   ├── authentication.md
│   ├── wallets.md
│   └── funding.md
├── api/                   # API reference
│   ├── frontend.md
│   └── backend.md
└── examples/              # Examples and patterns
    ├── complete-app.md
    └── common-patterns.md
```

## Security

This documentation site uses VitePress 1.6.4 with security overrides to patch known vulnerabilities in dependencies:

- esbuild: Updated to >=0.25.0
- vite: Updated to >=6.4.2

These overrides are configured in `package.json` under the `pnpm.overrides` field.

## Contributing

To add new documentation pages:

1. Create a new `.md` file in the appropriate directory
2. Add the page to the sidebar in `.vitepress/config.ts`
3. Test locally with `pnpm docs:dev`
4. Build and verify with `pnpm docs:build`

## Deployment

The documentation can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Build output is in `docs/.vitepress/dist/`
