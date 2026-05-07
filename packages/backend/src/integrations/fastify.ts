import type { BetterAuthLike } from "../adapters/better-auth.js";
import type { EasyAuthBackend } from "../config.js";
import { createEasyAuthRouteHandlers } from "../handlers/index.js";
import type {
  EasyAuthHandlerInput,
  EasyAuthHandlerResponse
} from "../types.js";

export interface FastifyLike {
  get(path: string, handler: FastifyRouteHandler): unknown;
  post(path: string, handler: FastifyRouteHandler): unknown;
  addContentTypeParser?(
    contentType: string,
    options: FastifyContentTypeParserOptions,
    parser: FastifyContentTypeParser
  ): unknown;
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

export interface FastifyRawBodyRequestLike extends FastifyRequestLike {
  rawBody?: string | Uint8Array;
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

export interface RegisterEasyAuthFastifyRawBodyOptions {
  contentTypes?: string[];
  parseAs?: "string" | "buffer";
  bodyLimit?: number;
}

export interface FastifyContentTypeParserOptions {
  parseAs: "string" | "buffer";
  bodyLimit?: number;
}

export type FastifyContentTypeParser = (
  request: FastifyRawBodyRequestLike,
  body: string | Uint8Array,
  done: (error: Error | null, body?: unknown) => void
) => void;

export function registerEasyAuthFastifyRoutes(
  app: FastifyLike,
  backend: EasyAuthBackend,
  options: RegisterEasyAuthFastifyRoutesOptions = {}
) {
  const prefix = normalizePrefix(options.prefix);

  for (const route of createEasyAuthRouteHandlers(backend)) {
    const path = `${prefix}${route.path}`;
    const handler: FastifyRouteHandler = (request, reply) =>
      sendFastifyResponse(reply, route.handle(toHandlerInput(request)));

    if (route.method === "GET") {
      app.get(path, handler);
    } else {
      app.post(path, handler);
    }
  }
}

export function registerEasyAuthFastifyRawBody(
  app: Pick<FastifyLike, "addContentTypeParser">,
  options: RegisterEasyAuthFastifyRawBodyOptions = {}
) {
  if (!app.addContentTypeParser) {
    throw new Error("Fastify raw body setup requires addContentTypeParser.");
  }

  const contentTypes = options.contentTypes ?? ["application/json"];

  for (const contentType of contentTypes) {
    app.addContentTypeParser(
      contentType,
      {
        parseAs: options.parseAs ?? "string",
        bodyLimit: options.bodyLimit
      },
      parseRawJsonBody
    );
  }
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

function parseRawJsonBody(
  request: FastifyRawBodyRequestLike,
  body: string | Uint8Array,
  done: (error: Error | null, body?: unknown) => void
) {
  request.rawBody = body;

  try {
    const rawText = typeof body === "string" ? body : new TextDecoder().decode(body);
    done(null, rawText.length > 0 ? JSON.parse(rawText) : null);
  } catch (error) {
    done(error instanceof Error ? error : new Error("Invalid JSON request body."));
  }
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
