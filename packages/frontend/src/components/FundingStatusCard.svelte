<script lang="ts">
  import "../styles/easyauth.css";
  import type { EasyAuthFundingOrder } from "@easyauth/shared";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthThemeConfig } from "@easyauth/frontend";

  export let fundingOrder: EasyAuthFundingOrder | null = null;
  export let title = "Funding status";
  export let emptyLabel = "No funding order yet";
  export let theme: EasyAuthThemeConfig = {};

  let className = "";
  export { className as class };

  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: cardClass = createEasyAuthClassName("easyauth-card", resolvedTheme.classes.card, className);
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);
</script>

<section class={cardClass} style={themeStyle}>
  <div class={createEasyAuthClassName("easyauth-row", resolvedTheme.classes.row)}>
    <slot name="header" {title} {fundingOrder}>
      <h2 class={createEasyAuthClassName("easyauth-heading", resolvedTheme.classes.heading)}>{title}</h2>
    </slot>
    <slot name="badge" {fundingOrder}>
      {#if fundingOrder}
        <span class={createEasyAuthClassName("easyauth-badge", resolvedTheme.classes.badge)}>{fundingOrder.status}</span>
      {/if}
    </slot>
  </div>

  {#if fundingOrder}
    <slot name="status" {fundingOrder}>
      <div class={createEasyAuthClassName("easyauth-stack", resolvedTheme.classes.stack)}>
        <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>
          {fundingOrder.fiatAmount} {fundingOrder.fiatCurrency} to {fundingOrder.cryptoAsset}
        </p>
        <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>Payment: {fundingOrder.paymentStatus}</p>
        <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>Delivery: {fundingOrder.deliveryStatus}</p>
        {#if fundingOrder.failureReason}
          <slot name="error" {fundingOrder}>
            <p class={createEasyAuthClassName("easyauth-error", resolvedTheme.classes.error)}>{fundingOrder.failureReason}</p>
          </slot>
        {/if}
      </div>
    </slot>
  {:else}
    <slot name="empty" {emptyLabel}>
      <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>{emptyLabel}</p>
    </slot>
  {/if}
</section>
