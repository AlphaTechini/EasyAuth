<script>
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>EasyAuth - Simplified Authentication & Wallet Management</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<!-- Header -->
	<header class="bg-white shadow-sm">
		<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<div class="flex items-center space-x-2">
					<div class="w-8 h-8 bg-black rounded-lg"></div>
					<span class="text-xl font-bold text-gray-900">EasyAuth</span>
				</div>
				<button
					onclick={() => goto('/auth')}
					class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
				>
					Sign In
				</button>
			</div>
		</nav>
	</header>

	<!-- Hero Section -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
		<div class="text-center">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">
				Authentication & Wallets,<br />Simplified
			</h1>
			<p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
				EasyAuth provides a complete authentication and wallet management solution out of the box.
				No complex setup, no provider headaches, just install and go.
			</p>
			<button
				onclick={() => goto('/auth')}
				class="px-8 py-3 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition-colors"
			>
				Get Started
			</button>
		</div>
	</section>

	<!-- Features Section -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Feature 1 -->
			<div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Social Authentication</h3>
				<p class="text-gray-600">
					Seamless OAuth integration with Google and other providers. Users sign in with accounts
					they already trust.
				</p>
			</div>

			<!-- Feature 2 -->
			<div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Automatic Wallet Creation</h3>
				<p class="text-gray-600">
					Every authenticated user gets a Solana wallet automatically. No manual setup, no
					complicated flows.
				</p>
			</div>

			<!-- Feature 3 -->
			<div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Built-in Funding</h3>
				<p class="text-gray-600">
					Integrated Crossmint on-ramp lets users fund wallets with credit cards. No external
					redirects or third-party setup.
				</p>
			</div>

			<!-- Feature 4 -->
			<div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Zero Configuration</h3>
				<p class="text-gray-600">
					EasyAuth handles Crossmint configuration internally. You only need to provide API keys, we
					do the rest.
				</p>
			</div>

			<!-- Feature 5 -->
			<div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Production Ready</h3>
				<p class="text-gray-600">
					Built with security best practices. Session management, webhook verification, and error
					handling included.
				</p>
			</div>

			<!-- Feature 6 -->
			<div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Framework Agnostic</h3>
				<p class="text-gray-600">
					First-class Svelte and Fastify support. React and Express examples available in
					documentation.
				</p>
			</div>
		</div>
	</section>

	<!-- User Flow Section -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
		<div class="max-w-3xl mx-auto">
			<div class="space-y-8">
				<!-- Step 1 -->
				<div class="flex items-start space-x-4">
					<div
						class="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold"
					>
						1
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Sign In with Social</h3>
						<p class="text-gray-600">
							Users click "Sign In" and choose their preferred social provider. Google OAuth
							handles authentication securely.
						</p>
					</div>
				</div>

				<!-- Step 2 -->
				<div class="flex items-start space-x-4">
					<div
						class="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold"
					>
						2
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Automatic Wallet Setup</h3>
						<p class="text-gray-600">
							After authentication, EasyAuth creates a Solana wallet for the user automatically.
							No extra steps required.
						</p>
					</div>
				</div>

				<!-- Step 3 -->
				<div class="flex items-start space-x-4">
					<div
						class="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold"
					>
						3
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">View Dashboard</h3>
						<p class="text-gray-600">
							Users land on their dashboard where they can see their wallet address, current
							balance, and funding options.
						</p>
					</div>
				</div>

				<!-- Step 4 -->
				<div class="flex items-start space-x-4">
					<div
						class="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold"
					>
						4
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Fund with Ease</h3>
						<p class="text-gray-600">
							Click "Fund Wallet" to open the embedded checkout. Users enter card details and
							funds appear in their wallet.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Why EasyAuth Section -->
	<section class="bg-white py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose EasyAuth?</h2>
			<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
				<div class="flex items-start space-x-3">
					<svg
						class="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<div>
						<h3 class="font-semibold text-gray-900 mb-1">Save Development Time</h3>
						<p class="text-gray-600">
							Skip weeks of integration work. Install the SDK and you're ready to go.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<svg
						class="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<div>
						<h3 class="font-semibold text-gray-900 mb-1">Reduce Complexity</h3>
						<p class="text-gray-600">
							No need to juggle multiple providers. EasyAuth handles everything internally.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<svg
						class="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<div>
						<h3 class="font-semibold text-gray-900 mb-1">Better User Experience</h3>
						<p class="text-gray-600">
							Smooth authentication and funding flows keep users engaged and happy.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<svg
						class="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<div>
						<h3 class="font-semibold text-gray-900 mb-1">Scalable Architecture</h3>
						<p class="text-gray-600">
							Built with production in mind. Handles sessions, webhooks, and state management
							reliably.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
		<div class="bg-black rounded-2xl p-12 text-center">
			<h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
			<p class="text-gray-300 mb-8 text-lg">
				Experience the simplicity of EasyAuth. Sign in and see your wallet in seconds.
			</p>
			<button
				onclick={() => goto('/auth')}
				class="px-8 py-3 bg-white text-black text-lg rounded-lg hover:bg-gray-100 transition-colors font-semibold"
			>
				Try It Now
			</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 py-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
			<p>&copy; 2026 EasyAuth. Built for developers who value simplicity.</p>
		</div>
	</footer>
</div>
