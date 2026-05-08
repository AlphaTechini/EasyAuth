import type { EasyAuthChain, EasyAuthNetwork, WalletBalance } from "@easyauth/shared";
import type { EasyAuthBackendConfig } from "../config.js";
import { notFound, unauthorized } from "../errors.js";
import type { EasyAuthSessionRequest } from "../types.js";
import type { createSessionService } from "./session-service.js";

// Lamports per SOL
const LAMPORTS_PER_SOL = 1_000_000_000;

// Public Solana RPC endpoints per network
const SOLANA_RPC_URLS: Record<EasyAuthNetwork, string> = {
  devnet: "https://api.devnet.solana.com",
  mainnet: "https://api.mainnet-beta.solana.com"
};

export function createBalanceService(
  config: Pick<EasyAuthBackendConfig, "storage">,
  sessionService: ReturnType<typeof createSessionService>
) {
  return {
    async getWalletBalance(input: EasyAuthSessionRequest = {}): Promise<WalletBalance> {
      const session = await sessionService.getSession(input);

      if (!session) {
        throw unauthorized();
      }

      const wallet = await config.storage.getWalletByUserId(session.user.id);

      if (!wallet) {
        throw notFound("No wallet found. Create a wallet first.");
      }

      const network = wallet.network ?? "devnet";
      const lamports = await fetchSolBalance(wallet.address, network);
      const tokens = await fetchTokenBalances(wallet.address, network);

      return {
        address: wallet.address,
        chain: wallet.chain as EasyAuthChain,
        network,
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
        tokens,
        fetchedAt: new Date().toISOString()
      };
    }
  };
}

async function fetchSolBalance(address: string, network: EasyAuthNetwork): Promise<number> {
  const rpcUrl = SOLANA_RPC_URLS[network];

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address, { commitment: "confirmed" }]
    })
  });

  if (!response.ok) {
    // Return 0 rather than crashing — balance is non-critical
    return 0;
  }

  const data = await response.json() as SolanaRpcResponse<{ value: number }>;
  return data.result?.value ?? 0;
}

async function fetchTokenBalances(address: string, network: EasyAuthNetwork) {
  const rpcUrl = SOLANA_RPC_URLS[network];

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        address,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed", commitment: "confirmed" }
      ]
    })
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json() as SolanaRpcResponse<{ value: TokenAccountValue[] }>;
  const accounts = data.result?.value ?? [];

  return accounts
    .map(mapTokenAccount)
    .filter((t): t is NonNullable<typeof t> => t !== null);
}

function mapTokenAccount(account: TokenAccountValue) {
  const info = account.account?.data?.parsed?.info;

  if (!info) {
    return null;
  }

  const tokenAmount = info.tokenAmount;

  if (!tokenAmount || tokenAmount.uiAmount === 0) {
    return null;
  }

  return {
    token: info.mint ?? "",
    symbol: resolveTokenSymbol(info.mint),
    amount: tokenAmount.amount ?? "0",
    decimals: tokenAmount.decimals ?? 0,
    uiAmount: tokenAmount.uiAmount ?? 0
  };
}

// Resolve well-known token symbols from mint addresses.
// This covers the tokens most likely to appear in a funded devnet wallet.
function resolveTokenSymbol(mint: string | undefined): string {
  if (!mint) return "UNKNOWN";

  const KNOWN_TOKENS: Record<string, string> = {
    // USDC mainnet
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
    // USDC devnet (Circle)
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU": "USDC",
    // USDT mainnet
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
    // Wrapped SOL
    "So11111111111111111111111111111111111111112": "wSOL"
  };

  return KNOWN_TOKENS[mint] ?? mint.slice(0, 4) + "…" + mint.slice(-4);
}

interface SolanaRpcResponse<T> {
  result?: T;
  error?: { code: number; message: string };
}

interface TokenAccountValue {
  account?: {
    data?: {
      parsed?: {
        info?: {
          mint?: string;
          tokenAmount?: {
            amount?: string;
            decimals?: number;
            uiAmount?: number;
          };
        };
      };
    };
  };
}
