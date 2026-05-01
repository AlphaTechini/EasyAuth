import type { EasyAuthSession } from "@easyauth/shared";
import type { EasyAuthSessionRequest } from "../types.js";

export interface AuthAdapter {
  getSession(input: EasyAuthSessionRequest): Promise<EasyAuthSession | null>;
}
