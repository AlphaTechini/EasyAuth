// Demo data store for the happy path demo
// This is a frontend-only implementation for demo purposes

import { writable } from 'svelte/store';

// Default demo user
export const demoUser = {
	id: 'demo-user-123',
	email: 'demo@easyauth.app',
	name: 'Demo User',
	imageUrl: null
};

// Default demo wallet
export const demoWallet = {
	id: 'demo-wallet-456',
	address: 'EsYxHJXTvU7VheFKkx4qbnD4nydG9Yq4q8YiPATJ1jLJ',
	provider: 'crossmint',
	chain: 'solana',
	network: 'devnet',
	status: 'active',
	userId: 'demo-user-123',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString()
};

// Default demo balance (using writable store for reactivity)
export const demoBalance = writable({
	address: 'EsYxHJXTvU7VheFKkx4qbnD4nydG9Yq4q8YiPATJ1jLJ',
	chain: 'solana',
	network: 'devnet',
	lamports: 5000000000,
	sol: 5,
	tokens: [
		{
			token: 'USDC',
			symbol: 'USDC',
			amount: '50000000',
			decimals: 6,
			uiAmount: 50
		}
	],
	fetchedAt: new Date().toISOString()
});

// Default demo transactions (matching the initial 5 SOL balance)
export const demoTransactions = writable([
	{
		id: 'demo-tx-001',
		provider: 'crossmint',
		status: 'funded',
		paymentStatus: 'paid',
		deliveryStatus: 'completed',
		fiatAmount: 750,
		fiatCurrency: 'USD',
		cryptoAmount: '5.0000',
		cryptoAsset: 'SOL',
		chain: 'solana',
		network: 'devnet',
		walletId: 'demo-wallet-456',
		createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
	}
]);

// Demo session store
export const demoSession = writable(null);

// Initialize demo session
export function initializeDemoSession() {
	const session = {
		user: demoUser,
		expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
	};
	demoSession.set(session);
	return session;
}

// Clear demo session
export function clearDemoSession() {
	demoSession.set(null);
}

// Get current demo session
export function getDemoSession() {
	let session;
	demoSession.subscribe((s) => {
		session = s;
	})();
	return session;
}

// Add a demo transaction
export function addDemoTransaction(transaction) {
	demoTransactions.update((txs) => [transaction, ...txs]);
}

// Update demo balance
export function updateDemoBalance(newBalance) {
	demoBalance.update((current) => ({
		...current,
		...newBalance
	}));
}
