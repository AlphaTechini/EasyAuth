<script>
	import { toasts, dismissToast } from '$lib/toast.js';
	import Toast from './Toast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
	{#each $toasts as toast (toast.id)}
		<Toast
			message={toast.message}
			type={toast.type}
			duration={toast.duration}
			onClose={() => dismissToast(toast.id)}
		/>
	{/each}
</div>
