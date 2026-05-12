import {
	handleCreateFundingOrder,
	handleCreateWallet,
	handleGetFundingHistory,
	handleGetFundingStatus,
	handleGetWallet,
	handleGetWalletBalance,
	handleSession,
	handleWebhook
} from '@easyauth/backend/handlers';
import { getDemoAuth, getDemoBackend } from './demo-backend.js';
import { createEasyAuthInput } from './sveltekit-input.js';
import { jsonError, toSvelteKitResponse } from './sveltekit-response.js';

export async function handleApiRequest(event) {
	try {
		const path = normalizeApiPath(event.params.path);

		if (path === '/auth' || path.startsWith('/auth/')) {
			return await handleBetterAuthRequest(event.request);
		}

		return await handleEasyAuthRequest(event, path);
	} catch (error) {
		return jsonError(
			500,
			error instanceof Error ? error.message : 'The EasyAuth demo API failed.',
			'configuration_error'
		);
	}
}

async function handleBetterAuthRequest(request) {
	const auth = await getDemoAuth();
	return auth.handler(request);
}

async function handleEasyAuthRequest(event, path) {
	const method = event.request.method.toUpperCase();

	if (method === 'GET' && path === '/session') {
		const backend = await getDemoBackend();
		return toSvelteKitResponse(await handleSession(backend, await createEasyAuthInput(event)));
	}

	if (method === 'GET' && path === '/wallet') {
		const backend = await getDemoBackend();
		return toSvelteKitResponse(await handleGetWallet(backend, await createEasyAuthInput(event)));
	}

	if (method === 'POST' && path === '/wallet') {
		const backend = await getDemoBackend();
		return toSvelteKitResponse(await handleCreateWallet(backend, await createEasyAuthInput(event)));
	}

	if (method === 'GET' && path === '/wallet/balance') {
		const backend = await getDemoBackend();
		return toSvelteKitResponse(await handleGetWalletBalance(backend, await createEasyAuthInput(event)));
	}

	if (method === 'POST' && path === '/funding/orders') {
		const backend = await getDemoBackend();
		return toSvelteKitResponse(await handleCreateFundingOrder(backend, await createEasyAuthInput(event)));
	}

	if (method === 'GET' && path === '/funding/history') {
		const backend = await getDemoBackend();
		return toSvelteKitResponse(await handleGetFundingHistory(backend, await createEasyAuthInput(event)));
	}

	if (method === 'GET' && path.startsWith('/funding/')) {
		const backend = await getDemoBackend();
		const id = decodeURIComponent(path.slice('/funding/'.length));

		return toSvelteKitResponse(
			await handleGetFundingStatus(
				backend,
				await createEasyAuthInput(event, {
					params: { id }
				})
			)
		);
	}

	if (method === 'POST' && path === '/webhooks/crossmint') {
		const backend = await getDemoBackend();
		const rawBody = await event.request.text();
		return toSvelteKitResponse(await handleWebhook(backend, await createEasyAuthInput(event, { rawBody })));
	}

	return jsonError(404, `EasyAuth demo API route ${method} /api${path} was not found.`, 'not_found');
}

function normalizeApiPath(path) {
	const normalizedPath = Array.isArray(path) ? path.join('/') : path ?? '';
	return `/${normalizedPath}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}
