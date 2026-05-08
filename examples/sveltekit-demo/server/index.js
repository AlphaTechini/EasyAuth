import Fastify from 'fastify';
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth';
import { createCrossmintWalletAdapter, createCrossmintFundingAdapter } from '@easyauth/backend/adapters/crossmint';
import { createMemoryStorage } from '@easyauth/backend/storage/memory';
import { registerEasyAuthRoutes } from '@easyauth/backend/integrations/fastify';
import { betterAuth } from 'better-auth';

const PORT = process.env.PORT || 3000;

const fastify = Fastify({
	logger: true
});

// Better Auth setup
const auth = betterAuth({
	database: {
		provider: 'sqlite',
		url: ':memory:'
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret'
		}
	},
	secret: process.env.BETTER_AUTH_SECRET || 'demo-secret-key-change-in-production',
	baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000'
});

// EasyAuth adapters
const authAdapter = createBetterAuthAdapter({ auth });
const walletAdapter = createCrossmintWalletAdapter({
	apiKey: process.env.CROSSMINT_API_KEY || 'demo-api-key',
	projectId: process.env.CROSSMINT_PROJECT_ID || 'demo-project-id'
});
const fundingAdapter = createCrossmintFundingAdapter({
	apiKey: process.env.CROSSMINT_API_KEY || 'demo-api-key',
	projectId: process.env.CROSSMINT_PROJECT_ID || 'demo-project-id'
});
const storage = createMemoryStorage();

// Register Better Auth routes
fastify.all('/api/auth/*', async (request, reply) => {
	const response = await auth.handler(request.raw);
	reply.status(response.status);
	
	for (const [key, value] of Object.entries(response.headers)) {
		reply.header(key, value);
	}
	
	if (response.body) {
		reply.send(response.body);
	} else {
		reply.send();
	}
});

// Register EasyAuth routes
registerEasyAuthRoutes(fastify, {
	authAdapter,
	walletAdapter,
	fundingAdapter,
	storage
});

// Health check
fastify.get('/health', async () => {
	return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
	try {
		await fastify.listen({ port: PORT, host: '0.0.0.0' });
		console.log(`Server running on http://localhost:${PORT}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
