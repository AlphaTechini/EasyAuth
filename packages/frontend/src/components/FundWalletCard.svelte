<script lang="ts">
  import "../styles/easyauth.css";
  import type { EasyAuthFundingOrder, EasyAuthWallet } from "@easyauth/shared";
  import { getEasyAuthClient } from "../../dist/ui-context.js";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthFrontendClient, EasyAuthThemeConfig } from "@easyauth/frontend";

  export let client: EasyAuthFrontendClient | null = null;
  export let wallet: EasyAuthWallet | null = null;
  export let amount = 25;
  export let currency = "USD";
  export let asset = "USDC";
  export let checkoutMode: "embedded" | "hosted" = "embedded";
  export let title = "Fund wallet";
  export let submitLabel = "Continue to checkout";
  export let theme: EasyAuthThemeConfig = {};
  export let onFundingCreated: (order: EasyAuthFundingOrder) => void = () => {};
  export let onError: (error: unknown) => void = () => {};

  let loading = false;
  let error: unknown = null;
  let className = "";
  export { className as class };
  const contextClient = getEasyAuthClient();

  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: cardClass = createEasyAuthClassName("easyauth-card", resolvedTheme.classes.card, className);
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);
  $: activeClient = client ?? $contextClient;

  async function submitFunding() {
    if (!activeClient) {
      return;
    }

    try {
      loading = true;
      error = null;
      const order = await activeClient.fundWallet({
        amount,
        currency,
        asset,
        walletId: wallet?.id,
        checkoutMode,
        openCheckout: checkoutMode === "hosted"
      });
      onFundingCreated(order);
    } catch (caughtError) {
      error = caughtError;
      onError(caughtError);
    } finally {
      loading = false;
    }
  }
</script>

<section class={cardClass} style={themeStyle}>
  <div class={createEasyAuthClassName("easyauth-row", resolvedTheme.classes.row)}>
    <slot name="header" {title} {wallet}>
      <h2 class={createEasyAuthClassName("easyauth-heading", resolvedTheme.classes.heading)}>{title}</h2>
    </slot>
    <slot name="badge" {asset}>
      <span class={createEasyAuthClassName("easyauth-badge", resolvedTheme.classes.badge)}>{asset}</span>
    </slot>
  </div>

  <slot name="form" {amount} {currency} {asset} {wallet}>
    <div class={createEasyAuthClassName("easyauth-stack", resolvedTheme.classes.stack)}>
      <label class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)} for="easyauth-fund-amount">Amount</label>
      <input
        id="easyauth-fund-amount"
        class={createEasyAuthClassName("easyauth-field", resolvedTheme.classes.field)}
        min="1"
        type="number"
        bind:value={amount}
      />
    </div>
  </slot>

  {#if error}
    <slot name="error" {error}>
      <p class={createEasyAuthClassName("easyauth-error", resolvedTheme.classes.error)}>Funding could not be started. Please try again.</p>
    </slot>
  {/if}

  <slot name="actions" {loading} {submitLabel} {submitFunding}>
    <button
      class={createEasyAuthClassName("easyauth-button easyauth-button-primary", resolvedTheme.classes.button, resolvedTheme.classes.buttonPrimary)}
      type="button"
      disabled={loading || !activeClient}
      on:click={submitFunding}
    >
      {loading ? "Starting checkout..." : submitLabel}
    </button>
  </slot>
</section>
