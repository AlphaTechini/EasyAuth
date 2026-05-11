<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let transactions = $state([]);
	let loading = $state(true);

	onMount(async () => {
		await loadHistory();
	});

	async function loadHistory() {
		try {
			const response = await fetch('/api/funding/history');
			if (response.ok) {
				const payload = await response.json();
				transactions = Array.isArray(payload) ? payload : payload.transactions ?? [];
			} else if (response.status === 401) {
				goto('/auth');
			}
		} catch (error) {
			console.error('Failed to load history:', error);
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(dateString) {
		const date = new Date(dateString);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusColor(status) {
		switch (status) {
			case 'completed':
			case 'funded':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'failed':
				return 'bg-red-100 text-red-800';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusLabel(status) {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function getFiatAmount(transaction) {
		return transaction.fiatAmount ?? transaction.amount ?? '0';
	}

	function getFiatCurrency(transaction) {
		return transaction.fiatCurrency ?? transaction.currency ?? 'USD';
	}

	async function handleLogout() {
		try {
			await fetch('/api/auth/sign-out', { method: 'POST' });
			goto('/');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

<svelte:head>
	<title>Transaction History - EasyAuth</title>
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
					class="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
					class="flex items-center space-x-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium"
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
			<div class="max-w-6xl">
				<!-- Header -->
				<div class="mb-8">
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
					<p class="text-gray-600">View all your funding transactions</p>
				</div>

				{#if loading}
					<div class="flex items-center justify-center h-64">
						<div class="text-gray-600">Loading transactions...</div>
					</div>
				{:else if transactions.length === 0}
					<div class="bg-white rounded-xl shadow-sm p-12 text-center">
						<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h2 class="text-xl font-semibold text-gray-900 mb-2">No Transactions Yet</h2>
						<p class="text-gray-600 mb-6">
							You haven't made any funding transactions. Start by adding funds to your wallet.
						</p>
						<a
							href="/dashboard"
							class="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
						>
							Go to Dashboard
						</a>
					</div>
				{:else}
					<!-- Transactions Table -->
					<div class="bg-white rounded-xl shadow-sm overflow-hidden">
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead class="bg-gray-50 border-b border-gray-200">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Transaction ID
										</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Amount
										</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Time
										</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200">
									{#each transactions as transaction}
										<tr class="hover:bg-gray-50 transition-colors">
											<td class="px-6 py-4 whitespace-nowrap">
												<code class="text-sm font-mono text-gray-900">
													{transaction.id.substring(0, 8)}...
												</code>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="text-sm font-medium text-gray-900">
													${getFiatAmount(transaction)} {getFiatCurrency(transaction)}
												</div>
												{#if transaction.cryptoAmount}
													<div class="text-xs text-gray-500">
														≈ {transaction.cryptoAmount} SOL
													</div>
												{/if}
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(transaction.status)}">
													{getStatusLabel(transaction.status)}
												</span>
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatDate(transaction.createdAt)}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatTime(transaction.createdAt)}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<!-- Summary Stats -->
					<div class="grid md:grid-cols-3 gap-6 mt-6">
						<div class="bg-white rounded-xl shadow-sm p-6">
							<p class="text-sm text-gray-600 mb-1">Total Transactions</p>
							<p class="text-2xl font-bold text-gray-900">{transactions.length}</p>
						</div>
						<div class="bg-white rounded-xl shadow-sm p-6">
							<p class="text-sm text-gray-600 mb-1">Completed</p>
							<p class="text-2xl font-bold text-green-600">
								{transactions.filter((t) => t.status === 'completed' || t.status === 'funded').length}
							</p>
						</div>
						<div class="bg-white rounded-xl shadow-sm p-6">
							<p class="text-sm text-gray-600 mb-1">Pending</p>
							<p class="text-2xl font-bold text-yellow-600">
								{transactions.filter((t) => t.status === 'pending').length}
							</p>
						</div>
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>
