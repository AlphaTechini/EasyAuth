<script>
	import { goto } from '$app/navigation';

	let notification = { message: '', visible: false };
	let notificationTimeout;
	let signingIn = false;

	function showNotification(message) {
		clearTimeout(notificationTimeout);
		notification = { message, visible: true };
		notificationTimeout = setTimeout(() => {
			notification = { message: '', visible: false };
		}, 3000);
	}

	async function handleGoogleLogin() {
		try {
			signingIn = true;
			const response = await fetch('/api/auth/sign-in/social', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					provider: 'google',
					callbackURL: `${window.location.origin}/dashboard`
				})
			});

			const payload = await readAuthPayload(response);

			if (!response.ok) {
				throw new Error(payload?.message || 'Google sign-in is not available yet. Check the demo API configuration.');
			}

			const redirectUrl = payload?.url || payload?.redirectURL;

			if (typeof redirectUrl !== 'string' || redirectUrl.length === 0) {
				throw new Error('Google sign-in did not return a redirect URL.');
			}

			window.location.assign(redirectUrl);
		} catch (error) {
			showNotification(error instanceof Error ? error.message : 'Google sign-in failed.');
		} finally {
			signingIn = false;
		}
	}

	function handleComingSoon() {
		showNotification('Coming soon use continue with Google instead');
	}

	function handleSupport() {
		showNotification('Support contact is coming soon.');
	}

	async function readAuthPayload(response) {
		const contentType = response.headers.get('content-type') || '';

		if (contentType.includes('application/json')) {
			return response.json();
		}

		const text = await response.text();
		if (contentType.includes('text/html') || text.trimStart().startsWith('<!doctype')) {
			return {};
		}

		return text ? { message: text } : {};
	}
</script>

<svelte:head>
	<title>Sign In - EasyAuth</title>
</svelte:head>

<svelte:window
	onclick={(e) => {
		if (notification.visible) {
			const toast = document.querySelector('.notification-toast');
			if (toast && !toast.contains(e.target)) {
				notification = { message: '', visible: false };
			}
		}
	}}
/>

<!-- Notification Toast -->
{#if notification.visible}
	<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 notification-toast">
		<div
			class="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in"
		>
			<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span class="font-medium">{notification.message}</span>
			<button
				onclick={() => (notification = { message: '', visible: false })}
				aria-label="Dismiss notification"
				class="ml-2 text-gray-400 hover:text-white transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Back Button -->
		<button
			onclick={() => goto('/')}
			class="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
		>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Home
		</button>

		<!-- Auth Card -->
		<div class="bg-white rounded-2xl shadow-xl p-8">
			<!-- Logo -->
			<div class="flex justify-center mb-6">
				<div class="w-16 h-16 bg-black rounded-xl"></div>
			</div>

			<!-- Title -->
			<h1 class="text-2xl font-bold text-center text-gray-900 mb-2">Welcome to EasyAuth</h1>
			<p class="text-center text-gray-600 mb-8">
				Sign in with your social account to get started
			</p>

			<!-- Social Login Buttons -->
			<div class="space-y-3">
				<!-- Google Button -->
				<button
					onclick={handleGoogleLogin}
					disabled={signingIn}
					class="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					<span class={signingIn ? 'font-medium text-gray-500' : 'font-medium text-gray-700'}>{signingIn ? 'Connecting...' : 'Continue with Google'}</span>
				</button>

				<!-- Facebook Button -->
				<button
					onclick={handleComingSoon}
					class="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
				>
					<svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
						<path
							d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
						/>
					</svg>
					<span class="font-medium text-gray-700">Continue with Facebook</span>
				</button>

				<!-- X (Twitter) Button -->
				<button
					onclick={handleComingSoon}
					class="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M18.244 2.25h3.308l-7.227 8.26 8.28 10.74h-6.49l-5.13-6.62-5.14 6.62H1.59l7.73-8.93L1.57 2.25h6.63l4.63 6.09 5.24-6.09zm-1.04 16.17h1.83L6.28 3.75H4.28l12.92 14.67z"
						/>
					</svg>
					<span class="font-medium text-gray-700">Continue with X</span>
				</button>
			</div>

			<!-- Divider -->
			<div class="relative my-8">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-gray-500">Secure authentication powered by Better Auth</span>
				</div>
			</div>

			<!-- Info -->
			<div class="text-center text-sm text-gray-600">
				<p>
					By signing in, you agree to our Terms of Service and Privacy Policy. Your wallet will be
					created automatically.
				</p>
			</div>
		</div>

		<!-- Additional Info -->
		<div class="mt-6 text-center text-sm text-gray-600">
			<p>
				Need help?
				<button type="button" onclick={handleSupport} class="text-black font-medium hover:underline">
					Contact Support
				</button>
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 200ms ease-out;
	}
</style>
