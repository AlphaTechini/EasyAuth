import { DEFAULT_EASYAUTH_ENDPOINTS, type FundingRequest } from "@easyauth/shared";
import type { BetterAuthLike } from "../adapters/better-auth.js";
import type { EasyAuthBackend } from "../config.js";
import {
  handleCreateFundingOrder,
  handleCreateWallet,
  handleGetFundingStatus,
  handleGetWallet,
  handleSession,
  handleWebhook
} from "../handlers/index.js";
import type {
  CreateWalletServiceInput,
  EasyAuthHandlerInput,
  EasyAuthHandlerResponse
} from "../types.js";

export interface FastifyLike {
  get(path: string, handler: FastifyRouteHandler): unknown;
  post(path: string, handler: FastifyRouteHandler): unknown;
  route?(options: {
    method: string | string[];
    url: string;
    handler: FastifyRouteHandler;
  }): unknown;
}

export interface FastifyRequestLike {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  params?: Record<string, string | undefined>;
  rawBody?: string | Uint8Array;
  raw?: unknown;
}

export interface FastifyReplyLike {
  status(code: number): FastifyReplyLike;
  header(name: string, value: string): FastifyReplyLike;
  send(body: unknown): unknown;
}

export type FastifyRouteHandler = (
  request: FastifyRequestLike,
  reply: FastifyReplyLike
) => unknown;

export interface RegisterEasyAuthFastifyRoutesOptions {
  prefix?: string;
}

export interface RegisterBetterAuthFastifyRoutesOptions {
  prefix?: string;
}

export function registerEasyAuthFastifyRoutes(
  app: FastifyLike,
  backend: EasyAuthBackend,
  options: RegisterEasyAuthFastifyRoutesOptions = {}
) {
  const prefix = normalizePrefix(options.prefix);

  app.get(`${prefix}${DEFAULT_EASYAUTH_ENDPOINTS.session}`, (request, reply) =>
    sendFastifyResponse(reply, handleSession(backend, toHandlerInput(request)))
  );
  app.get(`${prefix}${DEFAULT_EASYAUTH_ENDPOINTS.wallet}`, (request, reply) =>
    sendFastifyResponse(reply, handleGetWallet(backend, toHandlerInput(request)))
  );
  app.post(`${prefix}${DEFAULT_EASYAUTH_ENDPOINTS.createWallet}`, (request, reply) =>
    sendFastifyResponse(reply, handleCreateWallet(backend, toHandlerInput<CreateWalletServiceInput>(request)))
  );
  app.post(`${prefix}${DEFAULT_EASYAUTH_ENDPOINTS.fundingOrders}`, (request, reply) =>
    sendFastifyResponse(reply, handleCreateFundingOrder(backend, toHandlerInput<FundingRequest>(request)))
  );
  app.get(`${prefix}${DEFAULT_EASYAUTH_ENDPOINTS.fundingStatus}`, (request, reply) =>
    sendFastifyResponse(reply, handleGetFundingStatus(backend, toHandlerInput(request)))
  );
  app.post(`${prefix}/webhooks/crossmint`, (request, reply) =>
    sendFastifyResponse(reply, handleWebhook(backend, toHandlerInput(request)))
  );
}

export function registerBetterAuthFastifyRoutes(
  app: FastifyLike,
  auth: BetterAuthLike,
  options: RegisterBetterAuthFastifyRoutesOptions = {}
) {
  if (!auth.handler) {
    throw new Error("Better Auth route registration requires auth.handler.");
  }

  const prefix = normalizePrefix(options.prefix ?? "/auth");
  const path = `${prefix}/*`;
  const handler: FastifyRouteHandler = (request, reply) =>
    sendWebResponse(reply, auth.handler!(toWebRequest(request)));

  if (app.route) {
    app.route({
      method: ["GET", "POST"],
      url: path,
      handler
    });
    return;
  }

  app.get(path, handler);
  app.post(path, handler);
}

function toHandlerInput<TBody = unknown>(request: FastifyRequestLike): EasyAuthHandlerInput<TBody> {
  return {
    headers: request.headers,
    body: request.body as TBody,
    params: request.params,
    rawBody: request.rawBody,
    rawRequest: request.raw
  };
}

function toWebRequest(request: FastifyRequestLike) {
  const method = request.method ?? "GET";
  const headers = toWebHeaders(request.headers);
  const url = resolveRequestUrl(request.url ?? "/", headers);
  const body = method === "GET" || method === "HEAD" ? undefined : resolveRequestBody(request);

  return new Request(url, {
    method,
    headers,
    body
  });
}

function toWebHeaders(headers: FastifyRequestLike["headers"]) {
  const webHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      webHeaders.set(name, value.join(", "));
    } else if (value !== undefined) {
      webHeaders.set(name, value);
    }
  }

  return webHeaders;
}

function resolveRequestUrl(path: string, headers: Headers) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const protocol = headers.get("x-forwarded-proto") ?? "http";
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${protocol}://${host}${normalizedPath}`;
}

function resolveRequestBody(request: FastifyRequestLike) {
  if (request.rawBody !== undefined) {
    return request.rawBody instanceof Uint8Array
      ? copyArrayBuffer(request.rawBody)
      : request.rawBody;
  }

  if (request.body === undefined) {
    return undefined;
  }

  if (typeof request.body === "string" || request.body instanceof Uint8Array) {
    return request.body instanceof Uint8Array
      ? copyArrayBuffer(request.body)
      : request.body;
  }

  return JSON.stringify(request.body);
}

function copyArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function sendFastifyResponse(
  reply: FastifyReplyLike,
  responsePromise: Promise<EasyAuthHandlerResponse>
) {
  const response = await responsePromise;

  for (const [name, value] of Object.entries(response.headers ?? {})) {
    reply.header(name, value);
  }

  return reply.status(response.status).send(response.body);
}

async function sendWebResponse(reply: FastifyReplyLike, responsePromise: Promise<Response>) {
  const response = await responsePromise;
  const setCookies = readSetCookies(response.headers);

  response.headers.forEach((value, name) => {
    if (name.toLowerCase() === "set-cookie" && setCookies.length > 0) {
      return;
    }

    reply.header(name, value);
  });

  for (const cookie of setCookies) {
    reply.header("set-cookie", cookie);
  }

  const body = response.status === 204 ? null : await response.text();

  return reply.status(response.status).send(body);
}

function readSetCookies(headers: Headers) {
  const headersWithCookies = headers as Headers & {
    getSetCookie?: () => string[];
  };

  return headersWithCookies.getSetCookie?.() ?? [];
}

function normalizePrefix(prefix = "") {
  if (!prefix) {
    return "";
  }

  return prefix.startsWith("/") ? prefix.replace(/\/$/, "") : `/${prefix.replace(/\/$/, "")}`;
}
