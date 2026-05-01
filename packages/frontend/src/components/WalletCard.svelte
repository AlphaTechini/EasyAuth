<script lang="ts">
  import "../styles/easyauth.css";
  import type { EasyAuthSession, EasyAuthWallet } from "@easyauth/shared";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthThemeConfig } from "@easyauth/frontend";

  export let wallet: EasyAuthWallet | null = null;
  export let session: EasyAuthSession | null = null;
  export let balance: string | null = null;
  export let title = "Wallet";
  export let copyLabel = "Copy";
  export let copiedLabel = "Copied";
  export let emptyLabel = "No wallet connected";
  export let theme: EasyAuthThemeConfig = {};

  let copied = false;
  let className = "";
  export { className as class };

  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: cardClass = createEasyAuthClassName("easyauth-card", resolvedTheme.classes.card, className);
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);

  async function copyAddress() {
    if (!wallet?.address || !globalThis.navigator?.clipboard) {
      return;
    }

    await globalThis.navigator.clipboard.writeText(wallet.address);
    copied = true;
    window.setTimeout(() => {
      copied = false;
    }, 1400);
  }
</script>

<section class={cardClass} style={themeStyle}>
  <div class={createEasyAuthClassName("easyauth-row", resolvedTheme.classes.row)}>
    <slot name="header" {title} {wallet} {session}>
      <h2 class={createEasyAuthClassName("easyauth-heading", resolvedTheme.classes.heading)}>{title}</h2>
    </slot>
    <slot name="badge" {wallet}>
      {#if wallet}
        <span class={createEasyAuthClassName("easyauth-badge", resolvedTheme.classes.badge)}>{wallet.status}</span>
      {/if}
    </slot>
  </div>

  {#if session?.user}
    <slot name="user" {session}>
      <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>{session.user.email ?? session.user.name ?? "Signed in"}</p>
    </slot>
  {/if}

  {#if wallet}
    <slot name="wallet" {wallet} {balance} {copied} {copyAddress}>
      <div class={createEasyAuthClassName("easyauth-stack", resolvedTheme.classes.stack)}>
        <span class={createEasyAuthClassName("easyauth-address", resolvedTheme.classes.address)}>{wallet.address}</span>
        {#if balance}
          <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>{balance}</p>
        {/if}
        <slot name="actions" {wallet} {copied} {copyAddress}>
          <button class={createEasyAuthClassName("easyauth-button easyauth-button-secondary", resolvedTheme.classes.button, resolvedTheme.classes.buttonSecondary)} type="button" on:click={copyAddress}>
            {copied ? copiedLabel : copyLabel}
          </button>
        </slot>
      </div>
    </slot>
  {:else}
    <slot name="empty" {emptyLabel}>
      <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>{emptyLabel}</p>
    </slot>
  {/if}
</section>
