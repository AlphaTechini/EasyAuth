export const EASYAUTH_SHARED_PACKAGE = "@easyauth/shared";

export const DEFAULT_EASYAUTH_ENDPOINTS = {
  session: "/session",
  wallet: "/wallet",
  createWallet: "/wallet",
  walletBalance: "/wallet/balance",
  fundingOrders: "/funding/orders",
  fundingStatus: "/funding/:id",
  fundingHistory: "/funding/history",
  login: "/auth/sign-in/social",
  logout: "/auth/sign-out"
} as const;
