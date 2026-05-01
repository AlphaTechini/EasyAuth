<script lang="ts">
  import "../styles/easyauth.css";
  import type { EasyAuthSession, EasyAuthWallet } from "@easyauth/shared";
  import { getEasyAuthClient } from "../../dist/ui-context.js";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthFrontendClient, EasyAuthThemeConfig } from "@easyauth/frontend";

  export let client: EasyAuthFrontendClient | null = null;
  export let open = false;
  export let session: EasyAuthSession | null = null;
  export let wallet: EasyAuthWallet | null = null;
  export let title = "Connect with EasyAuth";
  export let description = "Sign in, create your embedded Solana wallet, and continue without handling seed phrases.";
  export let loginLabel = "Sign in with Google";
  export let connectLabel = "Create wallet";
  export let closeLabel = "Close";
  export let theme: EasyAuthThemeConfig = {};
  export let onClose: () => void = () => {};
  export let onConnected: (wallet: EasyAuthWallet) => void = () => {};
  export let onError: (error: unknown) => void = () => {};

  let loading = false;
  let error: unknown = null;
  let className = "";
  export { className as class };
  const contextClient = getEasyAuthClient();

  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: modalClass = createEasyAuthClassName("easyauth-modal", resolvedTheme.classes.modal, className);
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);
  $: activeClient = client ?? $contextClient;

  async function startLogin() {
    try {
      error = null;
      await activeClient?.login();
    } catch (caughtError) {
      error = caughtError;
      onError(caughtError);
    }
  }

  async function connectWallet() {
    if (!activeClient) {
      return;
    }

    try {
      loading = true;
      error = null;
      const createdWallet = await activeClient.createWallet();
      onConnected(createdWallet);
    } catch (caughtError) {
      error = caughtError;
      onError(caughtError);
    } finally {
      loading = false;
    }
  }
</script>

{#if open}
  <div class={modalClass} style={themeStyle} role="dialog" aria-modal="true" aria-labelledby="easyauth-login-title">
    <section class={createEasyAuthClassName("easyauth-modal-panel", resolvedTheme.classes.modalPanel)}>
      <div class={createEasyAuthClassName("easyauth-row", resolvedTheme.classes.row)}>
        <slot name="header" {title} {session} {wallet}>
          <h2 id="easyauth-login-title" class={createEasyAuthClassName("easyauth-heading", resolvedTheme.classes.heading)}>{title}</h2>
        </slot>
        <slot name="close" {closeLabel} {onClose}>
          <button class={createEasyAuthClassName("easyauth-button easyauth-button-secondary", resolvedTheme.classes.button, resolvedTheme.classes.buttonSecondary)} type="button" on:click={onClose}>
            {closeLabel}
          </button>
        </slot>
      </div>

      <slot name="description" {description}>
        <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>{description}</p>
      </slot>

      {#if error}
        <slot name="error" {error}>
          <p class={createEasyAuthClassName("easyauth-error", resolvedTheme.classes.error)}>Something went wrong. Please try again.</p>
        </slot>
      {/if}

      {#if !session}
        <slot name="login-action" {loginLabel} {startLogin}>
          <button class={createEasyAuthClassName("easyauth-button easyauth-button-primary", resolvedTheme.classes.button, resolvedTheme.classes.buttonPrimary)} type="button" on:click={startLogin}>
            {loginLabel}
          </button>
        </slot>
      {:else if wallet?.status === "active"}
        <slot name="connected" {wallet} {session}>
          <div class={createEasyAuthClassName("easyauth-stack", resolvedTheme.classes.stack)}>
            <span class={createEasyAuthClassName("easyauth-badge", resolvedTheme.classes.badge)}>Wallet connected</span>
            <span class={createEasyAuthClassName("easyauth-address", resolvedTheme.classes.address)}>{wallet.address}</span>
          </div>
        </slot>
      {:else}
        <slot name="connect-action" {connectLabel} {connectWallet} {loading}>
          <button class={createEasyAuthClassName("easyauth-button easyauth-button-primary", resolvedTheme.classes.button, resolvedTheme.classes.buttonPrimary)} type="button" disabled={loading} on:click={connectWallet}>
            {loading ? "Creating wallet..." : connectLabel}
          </button>
        </slot>
      {/if}
    </section>
  </div>
{/if}
