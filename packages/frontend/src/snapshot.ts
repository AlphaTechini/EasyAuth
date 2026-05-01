import type {
  EasyAuthFundingOrder,
  EasyAuthSession,
  EasyAuthWallet
} from "@easyauth/shared";
import type { EasyAuthClientSnapshot, EasyAuthClientStatus } from "./types.js";

export function createEasyAuthSnapshot(
  snapshot: Partial<EasyAuthClientSnapshot> = {}
): EasyAuthClientSnapshot {
  const normalizedSnapshot = {
    status: "idle",
    session: null,
    wallet: null,
    fundingOrder: null,
    error: null,
    ...snapshot
  } satisfies EasyAuthClientSnapshot;

  return {
    ...normalizedSnapshot,
    status: snapshot.status ?? deriveEasyAuthStatus(normalizedSnapshot)
  };
}

export function deriveEasyAuthStatus(snapshot: {
  session?: EasyAuthSession | null;
  wallet?: EasyAuthWallet | null;
  fundingOrder?: EasyAuthFundingOrder | null;
  error?: unknown;
}): EasyAuthClientStatus {
  if (snapshot.error) {
    return "error";
  }

  if (!snapshot.session) {
    return "unauthenticated";
  }

  if (snapshot.fundingOrder?.status === "funded") {
    return "funded";
  }

  if (
    snapshot.fundingOrder?.status === "pending" ||
    snapshot.fundingOrder?.status === "requires_action" ||
    snapshot.fundingOrder?.status === "paid"
  ) {
    return "funding_pending";
  }

  if (snapshot.wallet?.status === "active") {
    return "wallet_ready";
  }

  return "authenticated";
}
