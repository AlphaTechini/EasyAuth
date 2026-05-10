import Fastify from 'fastify';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { betterAuth } from 'better-auth';
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth';
import { createCrossmintWalletAdapter, createCrossmintFundingAdapter } from '@easyauth/backend/adapters/crossmint';
import { createEasyAuthBackend } from '@easyauth/backend';
import { createMemoryStorageAdapter } from '@easyauth/backend/storage/memory';
import {
	registerBetterAuthFastifyRoutes,
	registerEasyAuthFastifyRoutes
} from '@easyauth/backend/integrations/fastify';

const PORT = readPortEnv('PORT');
const CLIENT_ORIGIN = readRequiredEnv('CLIENT_ORIGIN');
const authDb = {
	user: [],
	session: [],
	account: [],
	verification: []
};

const fastify = Fastify({
	logger: true
});

const auth = betterAuth({
	database: memoryAdapter(authDb),
	socialProviders: {
		google: {
			clientId: readRequiredEnv('GOOGLE_CLIENT_ID'),
			clientSecret: readRequiredEnv('GOOGLE_CLIENT_SECRET')
		}
	},
	secret: readRequiredEnv('BETTER_AUTH_SECRET'),
	baseURL: readRequiredEnv('BETTER_AUTH_URL'),
	trustedOrigins: readCsvEnv('TRUSTED_ORIGINS', CLIENT_ORIGIN)
});

const authAdapter = createBetterAuthAdapter({ auth });
const walletAdapter = createCrossmintWalletAdapter({
	apiKey: readRequiredEnv('CROSSMINT_API_KEY')
});
const fundingAdapter = createCrossmintFundingAdapter({
	apiKey: readRequiredEnv('CROSSMINT_API_KEY'),
	webhookSecret: readRequiredEnv('CROSSMINT_WEBHOOK_SECRET'),
	tokenLocator: readRequiredEnv('CROSSMINT_TOKEN_LOCATOR'),
	clientApiKey: process.env.CROSSMINT_CLIENT_API_KEY
});
const storage = createMemoryStorageAdapter();
const backend = createEasyAuthBackend({
	auth: authAdapter,
	wallet: walletAdapter,
	funding: fundingAdapter,
	storage
});

registerBetterAuthFastifyRoutes(fastify, auth, { prefix: '/api/auth' });
registerEasyAuthFastifyRoutes(fastify, backend, { prefix: '/api' });

fastify.get('/health', async () => {
	return { status: 'ok', timestamp: new Date().toISOString() };
});

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

function readRequiredEnv(name) {
	const value = process.env[name];

	if (typeof value !== 'string' || value.trim().length === 0 || value.startsWith('your-')) {
		throw new Error(`${name} must be set in examples/sveltekit-demo/.env.`);
	}

	return value.trim();
}

function readPortEnv(name) {
	const value = readRequiredEnv(name);
	const port = Number(value);

	if (!Number.isInteger(port) || port <= 0 || port > 65535) {
		throw new Error(`${name} must be a valid TCP port.`);
	}

	return port;
}

function readCsvEnv(name, fallback) {
	const value = process.env[name] || fallback;

	return value
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
}
