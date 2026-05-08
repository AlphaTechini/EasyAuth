import {
  createFundingStatusPath,
  EasyAuthError,
  type EasyAuthApiEndpoints,
  type EasyAuthErrorCode,
  type EasyAuthErrorResponse,
  type EasyAuthFundingOrder,
  type EasyAuthSession,
  type EasyAuthWallet,
  type FundingHistoryResult,
  type FundingRequest,
  type WalletBalance,
  mergeEasyAuthEndpoints
} from "@easyauth/shared";

export type EasyAuthFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export interface EasyAuthApiClientConfig {
  baseUrl?: string;
  endpoints?: Partial<EasyAuthApiEndpoints>;
  fetch?: EasyAuthFetch;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
}

export interface EasyAuthApiClient {
  getSession(): Promise<EasyAuthSession | null>;
  getWallet(): Promise<EasyAuthWallet | null>;
  createWallet(): Promise<EasyAuthWallet>;
  getWalletBalance(): Promise<WalletBalance>;
  createFundingOrder(request: FundingRequest): Promise<EasyAuthFundingOrder>;
  getFundingStatus(fundingId: string): Promise<EasyAuthFundingOrder>;
  getFundingHistory(options?: { limit?: number; offset?: number }): Promise<FundingHistoryResult>;
  request<TResponse>(method: string, path: string, body?: unknown): Promise<TResponse>;
  resolveUrl(path: string): string;
}

export function createEasyAuthApiClient(
  config: EasyAuthApiClientConfig = {}
): EasyAuthApiClient {
  const endpoints = mergeEasyAuthEndpoints(config.endpoints);
  const requestFetch = config.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!requestFetch) {
    throw new EasyAuthError({
      code: "configuration_error",
      message: "EasyAuth requires a fetch implementation."
    });
  }

  const request = async <TResponse>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<TResponse> => {
    const response = await requestFetch(resolveUrl(config.baseUrl, path), {
      method,
      credentials: "include",
      headers: await createHeaders(config.headers, body),
      body: body === undefined ? undefined : JSON.stringify(body)
    }).catch((error: unknown) => {
      throw new EasyAuthError({
        code: "network_error",
        message: "EasyAuth could not reach the configured API endpoint.",
        details: error
      });
    });

    return readResponse<TResponse>(response);
  };

  return {
    getSession: () => request<EasyAuthSession | null>("GET", endpoints.session),
    getWallet: () => request<EasyAuthWallet | null>("GET", endpoints.wallet),
    createWallet: () => request<EasyAuthWallet>("POST", endpoints.createWallet),
    getWalletBalance: () => request<WalletBalance>("GET", endpoints.walletBalance),
    createFundingOrder: (fundingRequest) =>
      request<EasyAuthFundingOrder>("POST", endpoints.fundingOrders, fundingRequest),
    getFundingStatus: (fundingId) =>
      request<EasyAuthFundingOrder>(
        "GET",
        createFundingStatusPath(endpoints.fundingStatus, fundingId)
      ),
    getFundingHistory: (options = {}) => {
      const params = new URLSearchParams();
      if (options.limit !== undefined) params.set("limit", String(options.limit));
      if (options.offset !== undefined) params.set("offset", String(options.offset));
      const query = params.toString();
      const path = query ? `${endpoints.fundingHistory}?${query}` : endpoints.fundingHistory;
      return request<FundingHistoryResult>("GET", path);
    },
    request,
    resolveUrl: (path) => resolveUrl(config.baseUrl, path)
  };
}

async function createHeaders(
  headers: EasyAuthApiClientConfig["headers"],
  body: unknown
): Promise<HeadersInit> {
  const resolvedHeaders =
    typeof headers === "function" ? await headers() : headers ?? {};
  const requestHeaders = new Headers(resolvedHeaders);

  if (body !== undefined && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  return requestHeaders;
}

async function readResponse<TResponse>(response: Response): Promise<TResponse> {
  const payload = await readPayload(response);

  if (!response.ok) {
    throw toEasyAuthError(response, payload);
  }

  return payload as TResponse;
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function toEasyAuthError(response: Response, payload: unknown) {
  if (isEasyAuthErrorResponse(payload)) {
    return new EasyAuthError({
      ...payload,
      status: payload.status ?? response.status
    });
  }

  return new EasyAuthError({
    code: mapStatusToCode(response.status),
    message: `EasyAuth API request failed with status ${response.status}.`,
    status: response.status,
    details: payload
  });
}

function isEasyAuthErrorResponse(value: unknown): value is EasyAuthErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

function mapStatusToCode(status: number): EasyAuthErrorCode {
  if (status === 401 || status === 403) {
    return "unauthorized";
  }

  if (status === 404) {
    return "not_found";
  }

  if (status === 400 || status === 422) {
    return "validation_error";
  }

  return "unknown_error";
}

function resolveUrl(baseUrl: string | undefined, path: string) {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedBase = baseUrl?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

function isAbsoluteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
