import type {
  FundingCheckoutMode,
  FundingDeliveryStatus,
  FundingPaymentStatus,
  FundingStatus
} from "@easyauth/shared";
import { providerError, validationError } from "../errors.js";
import type {
  CreateProviderFundingOrderInput,
  FundingAdapter,
  VerifyFundingWebhookInput,
  VerifiedFundingWebhook
} from "./funding.js";
import {
  createCrossmintHttpClient,
  normalizeRequiredConfig,
  type CrossmintHttpClient,
  type CrossmintHttpClientConfig
} from "./crossmint-http.js";

export interface CrossmintFundingAdapterConfig extends CrossmintHttpClientConfig {
  webhookSecret: string;
  tokenLocator: string | ((input: CreateProviderFundingOrderInput) => string);
  clientApiKey?: string;
  createOrderBody?: (input: CreateProviderFundingOrderInput) => unknown;
  createCheckoutUrl?: (response: CrossmintCreateOrderResponse) => string | undefined;
  locale?: string;
  webhookToleranceSeconds?: number;
}

interface CrossmintCreateOrderResponse {
  clientSecret?: unknown;
  checkoutUrl?: unknown;
  order?: CrossmintOrderLike;
}

interface CrossmintOrderLike {
  orderId?: unknown;
  orderIdentifier?: unknown;
  phase?: unknown;
  payment?: {
    status?: unknown;
  };
  delivery?: {
    status?: unknown;
  };
  lineItems?: unknown;
}

interface CrossmintWebhookPayload {
  type?: unknown;
  eventType?: unknown;
  data?: unknown;
  payload?: unknown;
  order?: unknown;
  orderId?: unknown;
  orderIdentifier?: unknown;
  id?: unknown;
}

export function createCrossmintFundingAdapter(
  config: CrossmintFundingAdapterConfig
): FundingAdapter {
  const client = createCrossmintHttpClient(config);
  const webhookSecret = normalizeRequiredConfig(
    config.webhookSecret,
    "Crossmint webhook secret"
  );

  return createCrossmintFundingAdapterFromClient(client, {
    ...config,
    webhookSecret
  });
}

export function createCrossmintFundingAdapterFromClient(
  client: CrossmintHttpClient,
  config: Omit<CrossmintFundingAdapterConfig, keyof CrossmintHttpClientConfig> &
    Pick<
      CrossmintFundingAdapterConfig,
      "locale" | "clientApiKey" | "createOrderBody" | "createCheckoutUrl"
    >
): FundingAdapter {
  return {
    async createFundingOrder(input) {
      const order = await client.requestJson<CrossmintCreateOrderResponse>({
        method: "POST",
        path: "/2022-06-09/orders",
        body: config.createOrderBody?.(input) ?? createDefaultOrderBody(config, input)
      });

      return mapCreateOrderResponse(config, input, order);
    },
    async verifyWebhook(input) {
      const payload = await verifyCrossmintWebhook(input, config);
      return mapCrossmintWebhookPayload(payload, input.headers);
    }
  };
}

async function verifyCrossmintWebhook(
  input: VerifyFundingWebhookInput,
  config: Pick<CrossmintFundingAdapterConfig, "webhookSecret" | "webhookToleranceSeconds">
): Promise<CrossmintWebhookPayload> {
  const rawBody = normalizeRawBody(input.rawBody);
  const messageId = readRequiredHeader(input.headers, "svix-id");
  const timestamp = readRequiredHeader(input.headers, "svix-timestamp");
  const signatureHeader = readRequiredHeader(input.headers, "svix-signature");

  assertWebhookTimestamp(timestamp, config.webhookToleranceSeconds ?? 300);

  const expectedSignature = await createWebhookSignature(
    config.webhookSecret,
    `${messageId}.${timestamp}.${rawBody}`
  );

  if (!signatureMatches(signatureHeader, expectedSignature)) {
    throw providerError("Crossmint webhook signature verification failed.");
  }

  return parseWebhookBody(rawBody);
}

function createDefaultOrderBody(
  config: Pick<CrossmintFundingAdapterConfig, "tokenLocator" | "locale">,
  input: CreateProviderFundingOrderInput
) {
  const receiptEmail = input.user.email;

  if (!receiptEmail) {
    throw validationError(
      "Crossmint card funding requires an authenticated user email for the receipt."
    );
  }

  return {
    recipient: {
      walletAddress: input.wallet.address
    },
    payment: {
      method: "card",
      receiptEmail,
      currency: input.currency.toLowerCase()
    },
    lineItems: [
      {
        tokenLocator: resolveTokenLocator(config.tokenLocator, input),
        executionParameters: {
          mode: "exact-in",
          amount: String(input.amount)
        }
      }
    ],
    locale: config.locale ?? "en-US"
  };
}

function mapCreateOrderResponse(
  config: Pick<CrossmintFundingAdapterConfig, "clientApiKey" | "createCheckoutUrl">,
  input: CreateProviderFundingOrderInput,
  response: CrossmintCreateOrderResponse
) {
  const order = response.order;
  const providerOrderId = readOptionalString(order?.orderId);
  const clientSecret = readOptionalString(response.clientSecret);
  const paymentStatus = mapCrossmintPaymentStatus(order?.payment?.status);
  const deliveryStatus = mapCrossmintDeliveryStatus(order?.delivery?.status);
  const checkoutUrl =
    readOptionalString(response.checkoutUrl) ?? config.createCheckoutUrl?.(response);
  const checkoutMode: FundingCheckoutMode =
    providerOrderId && clientSecret ? "embedded" : "hosted";

  return {
    provider: "crossmint",
    providerOrderId,
    providerQuoteId: clientSecret,
    checkoutMode,
    checkoutUrl,
    embeddedCheckout:
      providerOrderId && clientSecret
        ? {
            provider: "crossmint" as const,
            orderId: providerOrderId,
            clientSecret,
            clientApiKey: readOptionalString(config.clientApiKey),
            receiptEmail: input.user.email
          }
        : undefined,
    paymentStatus,
    deliveryStatus,
    status: mapCrossmintFundingStatus(paymentStatus, deliveryStatus)
  };
}

function mapCrossmintWebhookPayload(
  payload: CrossmintWebhookPayload,
  headers: VerifyFundingWebhookInput["headers"]
): VerifiedFundingWebhook {
  const eventType = readOptionalString(payload.type ?? payload.eventType) ?? "crossmint.event";
  const order = resolveWebhookOrder(payload);
  const providerOrderId = readOptionalString(
    order?.orderId ?? order?.orderIdentifier ?? payload.orderId ?? payload.orderIdentifier
  );
  const paymentStatus = mapCrossmintPaymentStatus(
    order?.payment?.status ?? inferPaymentStatusFromEvent(eventType)
  );
  const deliveryStatus = mapCrossmintDeliveryStatus(
    order?.delivery?.status ?? inferDeliveryStatusFromEvent(eventType, order)
  );

  return {
    provider: "crossmint",
    dedupeKey: readRequiredHeader(headers, "svix-id"),
    eventType,
    payload,
    externalEventId: readOptionalString(payload.id),
    externalOrderId: providerOrderId,
    funding: providerOrderId
      ? {
          providerOrderId,
          paymentStatus,
          deliveryStatus,
          status: mapCrossmintFundingStatus(paymentStatus, deliveryStatus)
        }
      : undefined
  };
}

function resolveWebhookOrder(payload: CrossmintWebhookPayload): CrossmintOrderLike | undefined {
  if (isRecord(payload.order)) {
    return payload.order;
  }

  if (isRecord(payload.data)) {
    if (isRecord(payload.data.order)) {
      return payload.data.order;
    }

    return payload.data;
  }

  if (isRecord(payload.payload)) {
    return payload.payload;
  }

  return undefined;
}

function inferPaymentStatusFromEvent(eventType: string) {
  if (eventType === "orders.payment.succeeded") {
    return "completed";
  }

  if (eventType === "orders.payment.failed") {
    return "failed";
  }

  return undefined;
}

function inferDeliveryStatusFromEvent(eventType: string, order?: CrossmintOrderLike) {
  if (eventType === "orders.delivery.completed") {
    return "completed";
  }

  if (eventType === "orders.delivery.failed") {
    return "failed";
  }

  if (eventType === "orders.delivery.initiated") {
    return "in-progress";
  }

  return readNestedDeliveryStatus(order);
}

function readNestedDeliveryStatus(order?: CrossmintOrderLike) {
  if (!isRecord(order) || !Array.isArray(order.lineItems)) {
    return undefined;
  }

  for (const lineItem of order.lineItems) {
    if (isRecord(lineItem) && isRecord(lineItem.delivery)) {
      const status = lineItem.delivery.status;

      if (status !== undefined) {
        return status;
      }
    }
  }

  return undefined;
}

function mapCrossmintPaymentStatus(value: unknown): FundingPaymentStatus {
  const status = readOptionalString(value);

  if (status === "completed") {
    return "paid";
  }

  if (status === "requires-kyc" || status === "manual-kyc") {
    return "requires_kyc";
  }

  if (
    status === "failed" ||
    status === "failed-kyc" ||
    status === "crypto-payer-insufficient-funds" ||
    status === "crypto-payer-insufficient-funds-for-gas"
  ) {
    return "failed";
  }

  if (
    status === "requires-email" ||
    status === "requires-quote" ||
    status === "requires-recipient" ||
    status === "requires-recipient-verification" ||
    status === "requires-crypto-payer-address" ||
    status === "awaiting-payment"
  ) {
    return "requires_payment";
  }

  return "pending";
}

function mapCrossmintDeliveryStatus(value: unknown): FundingDeliveryStatus {
  const status = readOptionalString(value);

  if (status === "completed") {
    return "completed";
  }

  if (status === "failed") {
    return "failed";
  }

  if (status === "in-progress") {
    return "pending";
  }

  return "not_started";
}

function mapCrossmintFundingStatus(
  paymentStatus: FundingPaymentStatus,
  deliveryStatus: FundingDeliveryStatus
): FundingStatus {
  if (paymentStatus === "failed" || deliveryStatus === "failed") {
    return "failed";
  }

  if (deliveryStatus === "completed") {
    return "funded";
  }

  if (paymentStatus === "requires_kyc" || paymentStatus === "requires_payment") {
    return "requires_action";
  }

  if (paymentStatus === "paid") {
    return "paid";
  }

  return "pending";
}

function resolveTokenLocator(
  tokenLocator: CrossmintFundingAdapterConfig["tokenLocator"],
  input: CreateProviderFundingOrderInput
) {
  return typeof tokenLocator === "function" ? tokenLocator(input) : tokenLocator;
}

function normalizeRawBody(rawBody: VerifyFundingWebhookInput["rawBody"]) {
  if (typeof rawBody === "string") {
    return rawBody;
  }

  if (rawBody instanceof Uint8Array) {
    return new TextDecoder().decode(rawBody);
  }

  throw validationError("Crossmint webhook verification requires the raw request body.", {
    field: "rawBody"
  });
}

function readRequiredHeader(
  headers: VerifyFundingWebhookInput["headers"],
  name: string
) {
  const value = readHeader(headers, name);

  if (!value) {
    throw providerError(`Crossmint webhook header ${name} is required.`);
  }

  return value;
}

function readHeader(headers: VerifyFundingWebhookInput["headers"], name: string) {
  const expectedName = name.toLowerCase();

  for (const [headerName, value] of Object.entries(headers ?? {})) {
    if (headerName.toLowerCase() !== expectedName) {
      continue;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  return undefined;
}

function assertWebhookTimestamp(value: string, toleranceSeconds: number) {
  const timestamp = Number(value);

  if (!Number.isFinite(timestamp)) {
    throw providerError("Crossmint webhook timestamp is invalid.");
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (Math.abs(currentTimestamp - timestamp) > toleranceSeconds) {
    throw providerError("Crossmint webhook timestamp is outside the allowed tolerance.");
  }
}

async function createWebhookSignature(secret: string, signedContent: string) {
  const secretBytes = decodeBase64Url(secret.replace(/^whsec_/, ""));
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    secretBytes,
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );

  return encodeBase64(new Uint8Array(signature));
}

function signatureMatches(signatureHeader: string, expectedSignature: string) {
  return signatureHeader
    .split(" ")
    .map((signature) => signature.replace(/^v\d+,/, ""))
    .some((signature) => constantTimeEqual(signature, expectedSignature));
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function parseWebhookBody(rawBody: string): CrossmintWebhookPayload {
  try {
    const payload = JSON.parse(rawBody) as unknown;

    if (!isRecord(payload)) {
      throw new Error("Webhook payload was not an object.");
    }

    return payload;
  } catch {
    throw providerError("Crossmint webhook payload could not be parsed.", {
      provider: "crossmint"
    });
  }
}

function decodeBase64Url(value: string) {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue =
    normalizedValue + "=".repeat((4 - (normalizedValue.length % 4)) % 4);
  const binary = globalThis.atob(paddedValue);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return globalThis.btoa(binary);
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
