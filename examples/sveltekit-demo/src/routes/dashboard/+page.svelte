<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { demoWallet, demoBalance, demoSession, clearDemoSession, addDemoTransaction, updateDemoBalance } from '$lib/demo-data.js';
	import { success, error } from '$lib/toast.js';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { formatCardNumber, formatExpiryDate, formatCVC } from '$lib/card-utils.js';
	import { fetchSolanaPrice, convertUsdToSol } from '$lib/price-api.js';

	let session = $state(null);
	let wallet = $state(null);
	let balance = $state(null);
	let loading = $state(true);
	let showFundingModal = $state(false);
	let fundingAmount = $state('10');
	let cardNumber = $state('');
	let cardExpiry = $state('');
	let cardCvc = $state('');
	let cardName = $state('');
	let processingPayment = $state(false);
	let solPrice = $state(150); // Fallback price
	let loadingPrice = $state(false);

	// Handle card number input with auto-formatting
	function handleCardNumberInput(e) {
		const formatted = formatCardNumber(e.target.value);
		cardNumber = formatted;
	}

	// Handle expiry date input with auto-formatting
	function handleExpiryInput(e) {
		const formatted = formatExpiryDate(e.target.value);
		cardExpiry = formatted;
	}

	// Handle CVC input with auto-formatting
	function handleCvcInput(e) {
		const formatted = formatCVC(e.target.value);
		cardCvc = formatted;
	}

	// Fetch real-time SOL price
	async function updateSolPrice() {
		loadingPrice = true;
		const price = await fetchSolanaPrice();
		if (price) {
			solPrice = price;
		}
		loadingPrice = false;
	}

	onMount(() => {
		// Use demo session data
		const unsubscribeSession = demoSession.subscribe((s) => {
			session = s;
		});

		// If no session, redirect to auth
		if (!session) {
			goto('/auth');
			return;
		}

		// Use demo wallet
		wallet = demoWallet;

		// Subscribe to balance updates
		const unsubscribeBalance = demoBalance.subscribe((b) => {
			balance = b;
		});

		loading = false;

		// Fetch real-time SOL price
		updateSolPrice();

		// Update price every 60 seconds
		const priceInterval = setInterval(updateSolPrice, 60000);

		// Cleanup subscriptions
		return () => {
			unsubscribeSession();
			unsubscribeBalance();
			clearInterval(priceInterval);
		};
	});

	function handleLogout() {
		clearDemoSession();
		goto('/');
	}

	function openFundingModal() {
		showFundingModal = true;
		// Refresh price when opening modal
		updateSolPrice();
	}

	function closeFundingModal() {
		showFundingModal = false;
		// Reset form fields
		fundingAmount = '10';
		cardNumber = '';
		cardExpiry = '';
		cardCvc = '';
		cardName = '';
		processingPayment = false;
	}

	function handleFundWallet() {
		// Validate card details
		if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
			error('Please fill in all card details');
			return;
		}

		// Basic validation
		const cardDigits = cardNumber.replace(/\D/g, '');
		if (cardDigits.length !== 16) {
			error('Please enter a valid 16-digit card number');
			return;
		}

		const expiryDigits = cardExpiry.replace(/\D/g, '');
		if (expiryDigits.length !== 4) {
			error('Please enter a valid expiry date (MM/YY)');
			return;
		}

		const cvcDigits = cardCvc.replace(/\D/g, '');
		if (cvcDigits.length < 3) {
			error('Please enter a valid CVC');
			return;
		}

		// Simulate payment processing
		processingPayment = true;

		// Simulate a short delay for payment processing
		setTimeout(() => {
			// Create a demo funding transaction
			const amount = parseFloat(fundingAmount);
			const solAmount = amount / solPrice; // Use real-time price

			// Update the demo balance using the store
			updateDemoBalance({
				sol: balance.sol + solAmount,
				lamports: balance.lamports + solAmount * 1000000000,
				fetchedAt: new Date().toISOString()
			});

			// Create a transaction record
			const transaction = {
				id: 'demo-tx-' + Date.now(),
				provider: 'crossmint',
				status: 'funded',
				paymentStatus: 'paid',
				deliveryStatus: 'completed',
				fiatAmount: amount,
				fiatCurrency: 'USD',
				cryptoAmount: solAmount.toFixed(4),
				cryptoAsset: 'SOL',
				chain: 'solana',
				network: 'devnet',
				walletId: 'demo-wallet-456',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			// Add to transaction history
			addDemoTransaction(transaction);
			success(`Funding successful! Your wallet has been credited with ${solAmount.toFixed(4)} SOL`);
			closeFundingModal();
		}, 1500);
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
		success('Copied to clipboard!');
	}

	function readSolBalance(balance) {
		return Number(balance?.sol ?? 0);
	}
</script>

<svelte:head>
	<title>Dashboard - EasyAuth</title>
</svelte:head>

<ToastContainer />

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
											{wallet.address.substring(0, 4)}{'*'.repeat(36)}{wallet.address.substring(40)}
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
										{readSolBalance(balance).toFixed(4)} SOL
									</p>
									<p class="text-sm text-gray-600 mt-1">
										≈ ${(readSolBalance(balance) * solPrice).toFixed(2)} USD
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
					disabled={processingPayment}
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
				<!-- Amount Section -->
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
						disabled={processingPayment}
						class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
						placeholder="10"
					/>
				</div>

				<div class="bg-gray-50 p-4 rounded-lg">
					<p class="text-sm text-gray-600 mb-2">You will receive approximately:</p>
					<p class="text-2xl font-bold text-gray-900">
						{(parseFloat(fundingAmount) / solPrice).toFixed(4)} SOL
					</p>
					<p class="text-xs text-gray-500 mt-1">Exchange rate: 1 SOL ≈ ${solPrice.toFixed(2)} USD</p>
				</div>

				<!-- Card Details Section -->
				<div class="border-t pt-4">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
					
					<!-- Card Number -->
					<div class="mb-4">
						<label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-2">
							Card Number
						</label>
						<input
							id="cardNumber"
							type="text"
							value={cardNumber}
							oninput={handleCardNumberInput}
							disabled={processingPayment}
							maxlength="19"
							placeholder="1234 5678 9012 3456"
							class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
						/>
					</div>

					<!-- Card Name -->
					<div class="mb-4">
						<label for="cardName" class="block text-sm font-medium text-gray-700 mb-2">
							Cardholder Name
						</label>
						<input
							id="cardName"
							type="text"
							bind:value={cardName}
							disabled={processingPayment}
							placeholder="John Doe"
							class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
						/>
					</div>

					<!-- Expiry and CVC -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="cardExpiry" class="block text-sm font-medium text-gray-700 mb-2">
								Expiry Date
							</label>
							<input
								id="cardExpiry"
								type="text"
								value={cardExpiry}
								oninput={handleExpiryInput}
								disabled={processingPayment}
								maxlength="5"
								placeholder="MM/YY"
								class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
							/>
						</div>
						<div>
							<label for="cardCvc" class="block text-sm font-medium text-gray-700 mb-2">
								CVC
							</label>
							<input
								id="cardCvc"
								type="text"
								value={cardCvc}
								oninput={handleCvcInput}
								disabled={processingPayment}
								maxlength="4"
								placeholder="123"
								class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
							/>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex space-x-3 pt-4">
					<button
						onclick={closeFundingModal}
						disabled={processingPayment}
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						onclick={handleFundWallet}
						disabled={processingPayment}
						class="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{processingPayment ? 'Processing...' : 'Pay Now'}
					</button>
				</div>

				<p class="text-xs text-gray-500 text-center">
					Powered by Crossmint. Secure payment processing.
				</p>
			</div>
		</div>
	</div>
{/if}
