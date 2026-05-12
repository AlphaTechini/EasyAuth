export async function createEasyAuthInput(event, options = {}) {
	const body = options.rawBody
		? parseRawJsonBody(options.rawBody)
		: await readJsonBody(event.request);

	return {
		headers: Object.fromEntries(event.request.headers),
		cookies: event.request.headers.get('cookie') ?? undefined,
		body,
		params: {
			...Object.fromEntries(event.url.searchParams),
			...options.params
		},
		rawBody: options.rawBody,
		rawRequest: event.request
	};
}

async function readJsonBody(request) {
	if (request.method === 'GET' || request.method === 'HEAD') {
		return undefined;
	}

	const contentType = request.headers.get('content-type') ?? '';

	if (!contentType.includes('application/json')) {
		return undefined;
	}

	const text = await request.text();
	return text.length > 0 ? JSON.parse(text) : undefined;
}

function parseRawJsonBody(rawBody) {
	if (!rawBody) {
		return undefined;
	}

	return JSON.parse(rawBody);
}
