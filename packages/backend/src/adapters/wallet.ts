import type {
  EasyAuthChain,
  EasyAuthNetwork,
  EasyAuthUser,
  WalletStatus
} from "@easyauth/shared";

export interface CreateProviderWalletInput {
  user: EasyAuthUser;
  chain: EasyAuthChain;
  network: EasyAuthNetwork;
  idempotencyKey: string;
}

export interface ProviderWalletResult {
  address: string;
  provider: string;
  providerWalletId?: string;
  providerOwnerId: string;
  walletType?: string;
  status?: WalletStatus;
}

export interface WalletAdapter {
  createOrRetrieveWallet(input: CreateProviderWalletInput): Promise<ProviderWalletResult>;
}
