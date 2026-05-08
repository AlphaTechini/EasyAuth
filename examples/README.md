# EasyAuth Examples

This directory contains example applications demonstrating how to use the EasyAuth SDK.

## Available Examples

### SvelteKit Demo

A complete demo application showcasing EasyAuth's authentication and wallet management features.

**Location**: `sveltekit-demo/`

**Features**:
- Landing page with feature cards
- Social authentication (Google OAuth)
- Automatic wallet creation
- Dashboard with wallet info and balance
- Embedded funding flow
- Transaction history

**Tech Stack**:
- SvelteKit 2 + Tailwind CSS
- Fastify backend
- Better Auth for authentication
- Crossmint for wallets and funding
- In-memory storage (demo)

**Quick Start**:

```bash
# From workspace root
pnpm install
pnpm build

# Navigate to demo
cd examples/sveltekit-demo

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start backend server
pnpm server

# In another terminal, start frontend
pnpm dev
```

Visit http://localhost:5173 to see the demo.

For detailed setup instructions, see [sveltekit-demo/README.md](./sveltekit-demo/README.md).

## Future Examples

Planned examples to be added:

- **React + Express Demo**: Same features using React and Express
- **Next.js Demo**: Full-stack Next.js application
- **Minimal Integration**: Bare-bones example showing minimal setup
- **Custom Storage**: Example using Postgres storage adapter
- **Multi-Provider Auth**: Demo with multiple OAuth providers

## Contributing Examples

To add a new example:

1. Create a new directory in `examples/`
2. Add a comprehensive README explaining the example
3. Include setup instructions and environment configuration
4. Document any deviations from the main SDK patterns
5. Keep examples focused and easy to understand

## Learn More

- [EasyAuth Documentation](../README.md)
- [Frontend SDK](../packages/frontend/README.md)
- [Backend SDK](../packages/backend/README.md)
