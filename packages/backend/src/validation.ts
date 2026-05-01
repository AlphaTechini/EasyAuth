import type { EasyAuthNetwork, FundingCheckoutMode } from "@easyauth/shared";
import { validationError } from "./errors.js";
import type {
  CreateFundingServiceInput,
  CreateWalletServiceInput
} from "./types.js";

const EASYAUTH_NETWORKS = ["devnet", "mainnet"] as const;
const FUNDING_CHECKOUT_MODES = ["embedded", "hosted"] as const;

export function assertRecordBody(
  body: unknown,
  message: string
): Record<string, unknown> {
  if (!isRecord(body) || Array.isArray(body)) {
    throw validationError(message);
  }

  return body;
}

export function normalizeCreateWalletInput(
  input: CreateWalletServiceInput = {}
): CreateWalletServiceInput {
  return {
    network: normalizeNetwork(input.network)
  };
}

export function normalizeFundingInput(
  input: CreateFundingServiceInput
): Required<Pick<CreateFundingServiceInput, "amount" | "currency" | "asset">> &
  Pick<CreateFundingServiceInput, "walletId" | "returnUrl" | "checkoutMode"> {
  const amount = normalizePositiveAmount(input.amount);
  const currency = normalizeOptionalText(input.currency, "currency") ?? "USD";
  const asset = normalizeOptionalText(input.asset, "asset") ?? "USDC";
  const walletId = normalizeOptionalText(input.walletId, "walletId");
  const returnUrl = normalizeOptionalText(input.returnUrl, "returnUrl");
  const checkoutMode = normalizeCheckoutMode(input.checkoutMode);

  return {
    amount,
    currency,
    asset,
    walletId,
    returnUrl,
    checkoutMode
  };
}

export function normalizeRouteId(value: unknown, fieldName: string) {
  const routeId = normalizeOptionalText(value, fieldName);

  if (!routeId) {
    throw validationError(`${fieldName} route parameter is required.`, {
      field: fieldName
    });
  }

  return routeId;
}

function normalizeNetwork(value: unknown): EasyAuthNetwork | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (isEasyAuthNetwork(value)) {
    return value;
  }

  throw validationError("Wallet network must be devnet or mainnet.", {
    field: "network",
    allowedValues: EASYAUTH_NETWORKS
  });
}

function normalizeCheckoutMode(value: unknown): FundingCheckoutMode | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (isFundingCheckoutMode(value)) {
    return value;
  }

  throw validationError("Funding checkoutMode must be embedded or hosted.", {
    field: "checkoutMode",
    allowedValues: FUNDING_CHECKOUT_MODES
  });
}

function normalizePositiveAmount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw validationError("Funding amount must be a positive number.", {
      field: "amount"
    });
  }

  return value;
}

function normalizeOptionalText(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw validationError(`${field} must be a string when provided.`, {
      field
    });
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw validationError(`${field} cannot be empty.`, {
      field
    });
  }

  return normalizedValue;
}

function isEasyAuthNetwork(value: unknown): value is EasyAuthNetwork {
  return EASYAUTH_NETWORKS.includes(value as EasyAuthNetwork);
}

function isFundingCheckoutMode(value: unknown): value is FundingCheckoutMode {
  return FUNDING_CHECKOUT_MODES.includes(value as FundingCheckoutMode);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
