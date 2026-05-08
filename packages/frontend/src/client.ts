import {
  EasyAuthError,
  type EasyAuthFundingOrder,
  type EasyAuthSession,
  type EasyAuthWallet,
  mergeEasyAuthEndpoints
} from "@easyauth/shared";
import { createEasyAuthApiClient } from "./api-client.js";
import { createEasyAuthEventBus } from "./events.js";
import { mergeEasyAuthTheme } from "./theme.js";
import type {
  EasyAuthConfig,
  EasyAuthFrontendClient,
  LoginOptions
} from "./types.js";

export function initEasyAuth(config: EasyAuthConfig = {}): EasyAuthFrontendClient {
  const endpoints = mergeEasyAuthEndpoints(config.endpoints);
  const theme = mergeEasyAuthTheme(config.theme);
  const api = createEasyAuthApiClient({
    baseUrl: config.apiBaseUrl,
    endpoints: config.endpoints,
    fetch: config.fetch,
    headers: config.headers
  });
  const events = createEasyAuthEventBus();
  void theme;

  const emitError = (error: unknown) => {
    events.emit("error", error);
    throw error;
  };

  return {
    api,
    theme,
    async login(options) {
      try {
        const loginResponse = await api.request<SocialLoginResponse>(
          "POST",
          endpoints.login,
          createLoginBody(options)
        );
        openLoginUrl(readSocialLoginUrl(loginResponse));
      } catch (error) {
        return emitError(error);
      }
    },
    async getSession() {
      try {
        const session = await api.getSession();
        events.emit("session", session);
        return session;
      } catch (error) {
        return emitError(error);
      }
    },
    async getWallet() {
      try {
        const wallet = await api.getWallet();
        events.emit("wallet", wallet);
        return wallet;
      } catch (error) {
        return emitError(error);
      }
    },
    async createWallet() {
      try {
        const wallet = await api.createWallet();
        events.emit("wallet", wallet);
        return wallet;
      } catch (error) {
        return emitError(error);
      }
    },
    async getWalletBalance() {
      try {
        return await api.getWalletBalance();
      } catch (error) {
        return emitError(error);
      }
    },
    async fundWallet(options) {
      try {
        const { openCheckout = true, ...fundingRequest } = options;
        const fundingOrder = await api.createFundingOrder(fundingRequest);
        events.emit("funding", fundingOrder);

        if (openCheckout && fundingOrder.checkoutUrl) {
          openCheckoutUrl(fundingOrder.checkoutUrl);
        }

        return fundingOrder;
      } catch (error) {
        return emitError(error);
      }
    },
    async getFundingStatus(fundingId) {
      try {
        const fundingOrder = await api.getFundingStatus(fundingId);
        events.emit("funding", fundingOrder);
        return fundingOrder;
      } catch (error) {
        return emitError(error);
      }
    },
    async getFundingHistory(options) {
      try {
        return await api.getFundingHistory(options);
      } catch (error) {
        return emitError(error);
      }
    },
    on: events.on
  };
}

interface SocialLoginResponse {
  url?: unknown;
  redirectURL?: unknown;
}

function createLoginBody(options: LoginOptions = {}) {
  return {
    provider: options.provider ?? "google",
    callbackURL: options.returnTo,
    errorCallbackURL: options.errorCallbackURL,
    newUserCallbackURL: options.newUserCallbackURL
  };
}

function readSocialLoginUrl(response: SocialLoginResponse) {
  if (typeof response.url === "string" && response.url.length > 0) {
    return response.url;
  }

  if (typeof response.redirectURL === "string" && response.redirectURL.length > 0) {
    return response.redirectURL;
  }

  throw new EasyAuthError({
    code: "provider_error",
    message: "EasyAuth login did not receive a redirect URL from the auth provider."
  });
}

function openLoginUrl(loginUrl: string) {
  if (!globalThis.window) {
    throw new EasyAuthError({
      code: "configuration_error",
      message: "EasyAuth login requires a browser window."
    });
  }

  globalThis.window.location.assign(loginUrl);
}

function openCheckoutUrl(checkoutUrl: string) {
  if (!globalThis.window) {
    throw new EasyAuthError({
      code: "configuration_error",
      message: "EasyAuth checkout requires a browser window."
    });
  }

  globalThis.window.location.assign(checkoutUrl);
}
