import { json } from '@sveltejs/kit';

export function toSvelteKitResponse(response) {
	const headers = response.headers ?? {};

	if (response.body === undefined || response.body === null) {
		return new Response(null, {
			status: response.status,
			headers
		});
	}

	return json(response.body, {
		status: response.status,
		headers
	});
}

export function jsonError(status, message, code = 'unknown_error') {
	return json(
		{
			code,
			message,
			status
		},
		{ status }
	);
}
