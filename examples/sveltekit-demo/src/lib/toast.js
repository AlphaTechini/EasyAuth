import { writable } from 'svelte/store';

export const toasts = writable([]);

let nextId = 0;

export function showToast(message, type = 'success', duration = 3000) {
	const id = nextId++;
	const toast = { id, message, type, duration };
	
	toasts.update((all) => [...all, toast]);
	
	return id;
}

export function dismissToast(id) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}

export function success(message, duration) {
	return showToast(message, 'success', duration);
}

export function error(message, duration) {
	return showToast(message, 'error', duration);
}

export function info(message, duration) {
	return showToast(message, 'info', duration);
}
