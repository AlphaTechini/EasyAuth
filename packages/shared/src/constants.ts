export const EASYAUTH_SHARED_PACKAGE = "@easyauth/shared";

export const DEFAULT_EASYAUTH_ENDPOINTS = {
  session: "/session",
  wallet: "/wallet",
  createWallet: "/wallet",
  fundingOrders: "/funding/orders",
  fundingStatus: "/funding/:id",
  login: "/auth/sign-in/social",
  logout: "/auth/sign-out"
} as const;
