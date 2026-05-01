import type { EasyAuthBackendConfig } from "../config.js";
import type { EasyAuthSessionRequest } from "../types.js";

export function createSessionService(config: Pick<EasyAuthBackendConfig, "auth">) {
  return {
    getSession(input: EasyAuthSessionRequest = {}) {
      return config.auth.getSession(input);
    }
  };
}
