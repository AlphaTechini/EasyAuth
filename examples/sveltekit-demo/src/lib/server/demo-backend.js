import { memoryAdapter } from 'better-auth/adapters/memory';
import { betterAuth } from 'better-auth';
import { createBetterAuthAdapter } from '@easyauth/backend/adapters/better-auth';
import {
	createCrossmintFundingAdapter,
	createCrossmintWalletAdapter
} from '@easyauth/backend/adapters/crossmint';
import { createEasyAuthBackend } from '@easyauth/backend';
import { createMemoryStorageAdapter } from '@easyauth/backend/storage/memory';
import { createPostgresStorageAdapter } from '@easyauth/backend/storage/postgres';

const state = globalThis.__easyAuthDemoBackend ?? {
	auth: null,
	backend: null,
	pool: null,
	storage: null,
	authDb: {
		user: [],
		session: [],
		account: [],
		verification: []
	},
	migrated: false
};

globalThis.__easyAuthDemoBackend = state;

export async function getDemoAuth() {
	if (state.auth) {
		return state.auth;
	}

	const baseURL = readRequiredEnv('BETTER_AUTH_URL');

	state.auth = betterAuth({
		database: await createAuthDatabase(),
		socialProviders: {
			google: {
				clientId: readRequiredEnv('GOOGLE_CLIENT_ID'),
				clientSecret: readRequiredEnv('GOOGLE_CLIENT_SECRET')
			}
		},
		secret: readRequiredEnv('BETTER_AUTH_SECRET'),
		baseURL,
		trustedOrigins: readCsvEnv('TRUSTED_ORIGINS', baseURL)
	});

	return state.auth;
}

export async function getDemoBackend() {
	if (state.backend) {
		return state.backend;
	}

	const auth = await getDemoAuth();
	const storage = await getDemoStorage();

	state.backend = createEasyAuthBackend({
		auth: createBetterAuthAdapter({ auth }),
		wallet: createCrossmintWalletAdapter({
			apiKey: readRequiredEnv('CROSSMINT_API_KEY')
		}),
		funding: createCrossmintFundingAdapter({
			apiKey: readRequiredEnv('CROSSMINT_API_KEY'),
			webhookSecret: readRequiredEnv('CROSSMINT_WEBHOOK_SECRET'),
			tokenLocator: readRequiredEnv('CROSSMINT_TOKEN_LOCATOR'),
			clientApiKey: process.env.CROSSMINT_CLIENT_API_KEY
		}),
		storage
	});

	return state.backend;
}

async function createAuthDatabase() {
	const pool = await getPostgresPool();

	if (pool) {
		return pool;
	}

	return memoryAdapter(state.authDb);
}

async function getDemoStorage() {
	if (state.storage) {
		return state.storage;
	}

	const pool = await getPostgresPool();

	if (pool) {
		state.storage = await createPostgresStorageAdapter({ pool });
		await runDemoMigrations(state.storage);
		return state.storage;
	}

	state.storage = createMemoryStorageAdapter();
	return state.storage;
}

async function getPostgresPool() {
	if (state.pool) {
		return state.pool;
	}

	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		return null;
	}

	const { Pool } = await import('pg');
	state.pool = new Pool({
		connectionString: withRequiredSslMode(connectionString)
	});

	return state.pool;
}

async function runDemoMigrations(storage) {
	if (state.migrated || process.env.EASYAUTH_RUN_MIGRATIONS !== 'true') {
		return;
	}

	await storage.migrate();
	state.migrated = true;
}

function readRequiredEnv(name) {
	const value = process.env[name];

	if (typeof value !== 'string' || value.trim().length === 0 || value.startsWith('your-')) {
		throw new Error(`${name} must be configured for the EasyAuth demo backend.`);
	}

	return value.trim();
}

function readCsvEnv(name, fallback) {
	const value = process.env[name] || fallback;

	return value
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
}

function withRequiredSslMode(connectionString) {
	const url = new URL(connectionString);

	if (!url.searchParams.has('sslmode')) {
		url.searchParams.set('sslmode', 'require');
	}

	return url.toString();
}
