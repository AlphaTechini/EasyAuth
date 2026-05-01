import type { EasyAuthSession, EasyAuthUser } from "@easyauth/shared";
import { providerError } from "../errors.js";
import type { EasyAuthRequestHeaders, EasyAuthSessionRequest } from "../types.js";
import type { AuthAdapter } from "./auth.js";

export interface BetterAuthApiLike {
  getSession(input: { headers: Headers }): Promise<BetterAuthSessionResult | null>;
}

export interface BetterAuthLike {
  api: BetterAuthApiLike;
  handler?: (request: Request) => Promise<Response>;
}

export interface BetterAuthSessionResult {
  user?: BetterAuthUserLike | null;
  session?: BetterAuthSessionLike | null;
}

export interface BetterAuthUserLike {
  id?: unknown;
  email?: unknown;
  name?: unknown;
  image?: unknown;
  imageUrl?: unknown;
}

export interface BetterAuthSessionLike {
  expiresAt?: unknown;
  expires?: unknown;
}

export interface BetterAuthAdapterConfig {
  auth: BetterAuthLike;
}

export function createBetterAuthAdapter(config: BetterAuthAdapterConfig): AuthAdapter {
  return {
    async getSession(input: EasyAuthSessionRequest = {}) {
      const session = await config.auth.api
        .getSession({
          headers: toHeaders(input.headers, input.cookies)
        })
        .catch(() => {
          throw providerError("Better Auth session lookup failed.", {
            provider: "better-auth"
          });
        });

      return mapBetterAuthSession(session);
    }
  };
}

function mapBetterAuthSession(session: BetterAuthSessionResult | null): EasyAuthSession | null {
  if (!session?.user) {
    return null;
  }

  const userId = readRequiredString(session.user.id, "Better Auth user id");
  const user: EasyAuthUser = {
    id: userId,
    email: readOptionalString(session.user.email),
    name: readOptionalString(session.user.name),
    imageUrl: readOptionalString(session.user.imageUrl ?? session.user.image)
  };

  return {
    user,
    expiresAt: readOptionalDate(session.session?.expiresAt ?? session.session?.expires)
  };
}

function toHeaders(headers: EasyAuthRequestHeaders = {}, cookies?: string) {
  const requestHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      requestHeaders.set(name, value.join(", "));
    } else if (value !== undefined) {
      requestHeaders.set(name, value);
    }
  }

  if (cookies && !requestHeaders.has("cookie")) {
    requestHeaders.set("cookie", cookies);
  }

  return requestHeaders;
}

function readRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw providerError(`${fieldName} was missing from the Better Auth session.`);
  }

  return value;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readOptionalDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return readOptionalString(value);
}
