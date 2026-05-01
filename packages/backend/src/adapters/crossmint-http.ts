import { providerError, validationError } from "../errors.js";

export type EasyAuthFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export type CrossmintEnvironment = "staging" | "production";

export interface CrossmintHttpClientConfig {
  apiKey: string;
  environment?: CrossmintEnvironment;
  apiBaseUrl?: string;
  fetch?: EasyAuthFetch;
}

export interface CrossmintJsonRequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  idempotencyKey?: string;
}

export interface CrossmintHttpClient {
  requestJson<TResponse>(options: CrossmintJsonRequestOptions): Promise<TResponse>;
}

export function createCrossmintHttpClient(
  config: CrossmintHttpClientConfig
): CrossmintHttpClient {
  const apiKey = normalizeRequiredConfig(config.apiKey, "Crossmint API key");
  const requestFetch = config.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!requestFetch) {
    throw validationError("Crossmint adapters require a fetch implementation.");
  }

  return {
    async requestJson<TResponse>(options: CrossmintJsonRequestOptions) {
      const response = await requestFetch(resolveCrossmintUrl(config, options.path), {
        method: options.method ?? "GET",
        headers: createCrossmintHeaders(apiKey, options),
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
      }).catch(() => {
        throw providerError("Crossmint API request failed before receiving a response.", {
          provider: "crossmint"
        });
      });

      const payload = await readCrossmintPayload(response);

      if (!response.ok) {
        throw providerError(`Crossmint API request failed with status ${response.status}.`, {
          status: response.status,
          payload
        });
      }

      return payload as TResponse;
    }
  };
}

export function resolveCrossmintApiBaseUrl(config: {
  environment?: CrossmintEnvironment;
  apiBaseUrl?: string;
}) {
  if (config.apiBaseUrl) {
    return config.apiBaseUrl.replace(/\/$/, "");
  }

  return config.environment === "production"
    ? "https://www.crossmint.com/api"
    : "https://staging.crossmint.com/api";
}

export function normalizeRequiredConfig(value: unknown, name: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(`${name} is required.`);
  }

  return value.trim();
}

function createCrossmintHeaders(
  apiKey: string,
  options: CrossmintJsonRequestOptions
): Headers {
  const headers = new Headers({
    "content-type": "application/json",
    "x-api-key": apiKey
  });

  if (options.idempotencyKey) {
    headers.set("x-idempotency-key", options.idempotencyKey);
  }

  return headers;
}

async function readCrossmintPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function resolveCrossmintUrl(config: CrossmintHttpClientConfig, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveCrossmintApiBaseUrl(config)}${normalizedPath}`;
}
