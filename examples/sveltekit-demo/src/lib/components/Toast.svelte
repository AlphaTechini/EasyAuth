<script>
	import { onMount } from 'svelte';

	let { message = '', type = 'success', duration = 3000, onClose = () => {} } = $props();

	let visible = $state(true);

	onMount(() => {
		const timer = setTimeout(() => {
			visible = false;
			setTimeout(onClose, 300);
		}, duration);

		return () => clearTimeout(timer);
	});

	function handleClose() {
		visible = false;
		setTimeout(onClose, 300);
	}

	function getIcon() {
		switch (type) {
			case 'success':
				return `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>`;
			case 'error':
				return `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>`;
			case 'info':
				return `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>`;
			default:
				return '';
		}
	}

	function getBgColor() {
		switch (type) {
			case 'success':
				return 'bg-green-50 border-green-200';
			case 'error':
				return 'bg-red-50 border-red-200';
			case 'info':
				return 'bg-blue-50 border-blue-200';
			default:
				return 'bg-gray-50 border-gray-200';
		}
	}

	function getTextColor() {
		switch (type) {
			case 'success':
				return 'text-green-800';
			case 'error':
				return 'text-red-800';
			case 'info':
				return 'text-blue-800';
			default:
				return 'text-gray-800';
		}
	}
</script>

{#if visible}
	<div
		class="fixed top-4 right-4 z-50 animate-slide-in"
		role="alert"
	>
		<div class="flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border {getBgColor()} min-w-[300px] max-w-md">
			<div class="flex-shrink-0">
				{@html getIcon()}
			</div>
			<p class="flex-1 text-sm font-medium {getTextColor()}">
				{message}
			</p>
			<button
				onclick={handleClose}
				class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
				aria-label="Close notification"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in {
		animation: slide-in 300ms ease-out;
	}
</style>
