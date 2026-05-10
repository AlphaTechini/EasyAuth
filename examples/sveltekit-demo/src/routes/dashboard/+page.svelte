<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let session = $state(null);
	let wallet = $state(null);
	let balance = $state(null);
	let loading = $state(true);
	let showFundingModal = $state(false);
	let fundingAmount = $state('10');

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			// Fetch session
			const sessionRes = await fetch('/api/session');
			if (!sessionRes.ok) {
				goto('/auth');
				return;
			}
			session = await sessionRes.json();

			// Fetch wallet
			const walletRes = await fetch('/api/wallet');
			if (walletRes.ok) {
				wallet = await walletRes.json();
			} else if (walletRes.status === 404) {
				const createWalletRes = await fetch('/api/wallet', { method: 'POST' });
				if (createWalletRes.ok) {
					wallet = await createWalletRes.json();
				}
			}

			// Fetch balance
			const balanceRes = await fetch('/api/wallet/balance');
			if (balanceRes.ok) {
				balance = await balanceRes.json();
			}
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			loading = false;
		}
	}

	async function handleLogout() {
		try {
			await fetch('/api/auth/sign-out', { method: 'POST' });
			goto('/');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}

	function openFundingModal() {
		showFundingModal = true;
	}

	function closeFundingModal() {
		showFundingModal = false;
	}

	async function handleFundWallet() {
		try {
			const response = await fetch('/api/funding/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount: parseFloat(fundingAmount),
					currency: 'USD'
				})
			});

			if (response.ok) {
				const order = await response.json();
				alert('Funding order created! In production, this would open the Crossmint checkout.');
				closeFundingModal();
				await loadData();
			} else {
				alert('Failed to create funding order');
			}
		} catch (error) {
			console.error('Funding failed:', error);
			alert('An error occurred while creating the funding order');
		}
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
		alert('Copied to clipboard!');
	}
</script>

<svelte:head>
	<title>Dashboard - EasyAuth</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow-sm">
		<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<div class="flex items-center space-x-2">
					<div class="w-8 h-8 bg-black rounded-lg"></div>
					<span class="text-xl font-bold text-gray-900">EasyAuth</span>
				</div>
				<button
					onclick={handleLogout}
					class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
				>
					Sign Out
				</button>
			</div>
		</nav>
	</header>

	<div class="flex">
		<!-- Sidebar -->
		<aside class="w-64 bg-white min-h-screen shadow-sm">
			<nav class="p-4 space-y-2">
				<a
					href="/dashboard"
					class="flex items-center space-x-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					<span>Dashboard</span>
				</a>
				<a
					href="/dashboard/history"
					class="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>Transaction History</span>
				</a>
			</nav>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 p-8">
			{#if loading}
				<div class="flex items-center justify-center h-64">
					<div class="text-gray-600">Loading...</div>
				</div>
			{:else}
				<!-- Welcome Section -->
				<div class="mb-8">
					<h1 class="text-3xl font-bold text-gray-900 mb-2">
						Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!
					</h1>
					<p class="text-gray-600">Manage your wallet and view your balance</p>
				</div>

				<!-- Stats Grid -->
				<div class="grid md:grid-cols-2 gap-6 mb-8">
					<!-- Wallet Card -->
					<div class="bg-white rounded-xl shadow-sm p-6">
						<div class="flex items-center justify-between mb-4">
							<h2 class="text-lg font-semibold text-gray-900">Your Wallet</h2>
							<div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							</div>
						</div>
						{#if wallet}
							<div class="space-y-3">
								<div>
									<p class="text-sm text-gray-600 mb-1">Wallet Address</p>
									<div class="flex items-center space-x-2">
										<code class="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded flex-1 truncate">
											{wallet.address}
										</code>
										<button
											onclick={() => copyToClipboard(wallet.address)}
											class="p-2 hover:bg-gray-100 rounded transition-colors"
											title="Copy address"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
												/>
											</svg>
										</button>
									</div>
								</div>
								<div>
									<p class="text-sm text-gray-600 mb-1">Chain</p>
									<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
										Solana
									</span>
								</div>
							</div>
						{:else}
							<p class="text-gray-600">No wallet found. Creating wallet...</p>
						{/if}
					</div>

					<!-- Balance Card -->
					<div class="bg-white rounded-xl shadow-sm p-6">
						<div class="flex items-center justify-between mb-4">
							<h2 class="text-lg font-semibold text-gray-900">Balance</h2>
							<div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
						{#if balance}
							<div class="space-y-3">
								<div>
									<p class="text-3xl font-bold text-gray-900">
										{balance.balance || '0'} SOL
									</p>
									<p class="text-sm text-gray-600 mt-1">
										≈ ${((parseFloat(balance.balance) || 0) * 150).toFixed(2)} USD
									</p>
								</div>
								<button
									onclick={openFundingModal}
									class="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
								>
									Fund Wallet
								</button>
							</div>
						{:else}
							<p class="text-gray-600">Loading balance...</p>
						{/if}
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="bg-white rounded-xl shadow-sm p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
					<div class="grid md:grid-cols-3 gap-4">
						<button
							onclick={openFundingModal}
							class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
						>
							<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
							</div>
							<div class="text-left">
								<p class="font-medium text-gray-900">Add Funds</p>
								<p class="text-sm text-gray-600">Top up your wallet</p>
							</div>
						</button>

						<a
							href="/dashboard/history"
							class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
						>
							<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
							<div class="text-left">
								<p class="font-medium text-gray-900">View History</p>
								<p class="text-sm text-gray-600">See all transactions</p>
							</div>
						</a>

						<button
							disabled
							class="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
						>
							<div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
									/>
								</svg>
							</div>
							<div class="text-left">
								<p class="font-medium text-gray-500">Send Funds</p>
								<p class="text-sm text-gray-500">Coming soon</p>
							</div>
						</button>
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>

<!-- Funding Modal -->
{#if showFundingModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-bold text-gray-900">Fund Your Wallet</h2>
				<button
					onclick={closeFundingModal}
					aria-label="Close funding modal"
					class="text-gray-400 hover:text-gray-600 transition-colors"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
						Amount (USD)
					</label>
					<input
						id="amount"
						type="number"
						bind:value={fundingAmount}
						min="1"
						step="1"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
						placeholder="10"
					/>
				</div>

				<div class="bg-gray-50 p-4 rounded-lg">
					<p class="text-sm text-gray-600 mb-2">You will receive approximately:</p>
					<p class="text-2xl font-bold text-gray-900">
						{(parseFloat(fundingAmount) / 150).toFixed(4)} SOL
					</p>
					<p class="text-xs text-gray-500 mt-1">Exchange rate: 1 SOL ≈ $150 USD</p>
				</div>

				<div class="flex space-x-3">
					<button
						onclick={closeFundingModal}
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={handleFundWallet}
						class="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
					>
						Continue
					</button>
				</div>

				<p class="text-xs text-gray-500 text-center">
					Powered by Crossmint. Secure payment processing.
				</p>
			</div>
		</div>
	</div>
{/if}
