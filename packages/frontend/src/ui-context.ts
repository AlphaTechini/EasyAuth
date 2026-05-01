import { getContext, setContext } from "svelte";
import { readable, type Readable, type Writable } from "svelte/store";
import type { EasyAuthFrontendClient } from "./types.js";

const EASYAUTH_CLIENT_CONTEXT = Symbol("easyauth.client");
const EMPTY_CLIENT_CONTEXT = readable<EasyAuthFrontendClient | null>(null);

export function setEasyAuthClient(
  client: Readable<EasyAuthFrontendClient | null> | Writable<EasyAuthFrontendClient | null>
) {
  setContext(EASYAUTH_CLIENT_CONTEXT, client);
}

export function getEasyAuthClient() {
  return (
    getContext<Readable<EasyAuthFrontendClient | null>>(EASYAUTH_CLIENT_CONTEXT) ??
    EMPTY_CLIENT_CONTEXT
  );
}
