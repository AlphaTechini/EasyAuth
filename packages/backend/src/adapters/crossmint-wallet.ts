import type { EasyAuthChain, EasyAuthNetwork } from "@easyauth/shared";
import { providerError, validationError } from "../errors.js";
import type {
  CreateProviderWalletInput,
  ProviderWalletResult,
  WalletAdapter
} from "./wallet.js";
import {
  createCrossmintHttpClient,
  type CrossmintHttpClient,
  type CrossmintHttpClientConfig
} from "./crossmint-http.js";

export type CrossmintWalletType = "smart" | "mpc";

export interface CrossmintWalletAdapterConfig extends CrossmintHttpClientConfig {
  walletType?: CrossmintWalletType;
  ownerLocator?: (input: CreateProviderWalletInput) => string;
  alias?: string | ((input: CreateProviderWalletInput) => string | undefined);
}

interface CrossmintCreateWalletResponse {
  address?: unknown;
  type?: unknown;
  owner?: unknown;
  id?: unknown;
  walletId?: unknown;
  locator?: unknown;
}

export function createCrossmintWalletAdapter(
  config: CrossmintWalletAdapterConfig
): WalletAdapter {
  const client = createCrossmintHttpClient(config);

  return createCrossmintWalletAdapterFromClient(client, config);
}

export function createCrossmintWalletAdapterFromClient(
  client: CrossmintHttpClient,
  config: Pick<CrossmintWalletAdapterConfig, "walletType" | "ownerLocator" | "alias">
): WalletAdapter {
  return {
    async createOrRetrieveWallet(input) {
      assertSupportedWalletNetwork(input.chain, input.network);

      const owner = config.ownerLocator?.(input) ?? createUserOwnerLocator(input.user.id);
      const wallet = await client.requestJson<CrossmintCreateWalletResponse>({
        method: "POST",
        path: "/2025-06-09/wallets",
        idempotencyKey: input.idempotencyKey,
        body: {
          chainType: "solana",
          type: config.walletType ?? "smart",
          owner,
          alias: resolveAlias(config.alias, input)
        }
      });

      return mapCrossmintWallet(wallet, owner);
    }
  };
}

function mapCrossmintWallet(
  wallet: CrossmintCreateWalletResponse,
  owner: string
): ProviderWalletResult {
  if (typeof wallet.address !== "string" || wallet.address.trim().length === 0) {
    throw providerError("Crossmint wallet response did not include an address.", {
      provider: "crossmint"
    });
  }

  return {
    address: wallet.address,
    provider: "crossmint",
    providerWalletId: readOptionalString(wallet.id ?? wallet.walletId ?? wallet.locator),
    providerOwnerId: readOptionalString(wallet.owner) ?? owner,
    walletType: readOptionalString(wallet.type),
    status: "active"
  };
}

function assertSupportedWalletNetwork(chain: EasyAuthChain, network: EasyAuthNetwork) {
  if (chain !== "solana") {
    throw validationError("Crossmint wallet adapter currently supports Solana wallets only.", {
      chain
    });
  }

  if (network !== "devnet" && network !== "mainnet") {
    throw validationError("Crossmint wallet network must be devnet or mainnet.", {
      network
    });
  }
}

function createUserOwnerLocator(userId: string) {
  return `userId:${userId}`;
}

function resolveAlias(
  alias: CrossmintWalletAdapterConfig["alias"],
  input: CreateProviderWalletInput
) {
  if (typeof alias === "function") {
    return alias(input);
  }

  return alias;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
