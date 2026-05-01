import type { EasyAuthBackendConfig } from "../config.js";
import type { WebhookProcessResult, WebhookServiceInput } from "../types.js";
import { validationError } from "../errors.js";
import { deriveFundingStatus } from "./funding-service.js";

export function createWebhookService(
  config: Pick<EasyAuthBackendConfig, "funding" | "storage" | "security">
) {
  return {
    async processWebhook(input: WebhookServiceInput): Promise<WebhookProcessResult> {
      if (config.security?.requireWebhookRawBody ?? true) {
        requireWebhookRawBody(input.rawBody);
      }

      const webhook = await config.funding.verifyWebhook(input);
      const record = await config.storage.recordWebhookEvent({
        provider: webhook.provider,
        dedupeKey: webhook.dedupeKey,
        eventType: webhook.eventType,
        payload: webhook.payload,
        externalEventId: webhook.externalEventId,
        externalOrderId: webhook.externalOrderId
      });

      if (!record.recorded) {
        return {
          recorded: false,
          processed: false
        };
      }

      const transaction = await resolveFundingTransaction(config, webhook.funding);

      if (!transaction || !webhook.funding) {
        await config.storage.markWebhookEventProcessed(webhook.provider, webhook.dedupeKey);
        return {
          recorded: true,
          processed: false
        };
      }

      const paymentStatus = webhook.funding.paymentStatus ?? transaction.paymentStatus;
      const deliveryStatus = webhook.funding.deliveryStatus ?? transaction.deliveryStatus;
      const updatedTransaction = await config.storage.updateFundingTransaction(transaction.id, {
        paymentStatus,
        deliveryStatus,
        status:
          webhook.funding.status ??
          deriveFundingStatus(paymentStatus, deliveryStatus),
        failureReason: webhook.funding.failureReason ?? transaction.failureReason,
        updatedAt: new Date().toISOString()
      });

      await config.storage.markWebhookEventProcessed(webhook.provider, webhook.dedupeKey);

      return {
        recorded: true,
        processed: true,
        fundingOrder: updatedTransaction
      };
    }
  };
}

function requireWebhookRawBody(rawBody: WebhookServiceInput["rawBody"]) {
  if (rawBody === undefined) {
    throw validationError("Webhook raw body is required for signature verification.", {
      field: "rawBody"
    });
  }

  if (typeof rawBody === "string" && rawBody.length === 0) {
    throw validationError("Webhook raw body cannot be empty.", {
      field: "rawBody"
    });
  }

  if (rawBody instanceof Uint8Array && rawBody.byteLength === 0) {
    throw validationError("Webhook raw body cannot be empty.", {
      field: "rawBody"
    });
  }
}

async function resolveFundingTransaction(
  config: Pick<EasyAuthBackendConfig, "storage">,
  funding: Awaited<ReturnType<EasyAuthBackendConfig["funding"]["verifyWebhook"]>>["funding"]
) {
  if (!funding) {
    return null;
  }

  if (funding.transactionId) {
    return config.storage.getFundingTransaction(funding.transactionId);
  }

  if (funding.providerOrderId) {
    return config.storage.getFundingTransactionByProviderOrderId(funding.providerOrderId);
  }

  return null;
}
