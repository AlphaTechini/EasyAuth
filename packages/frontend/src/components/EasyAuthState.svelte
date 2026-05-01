<script lang="ts">
  import "../styles/easyauth.css";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthClientStatus, EasyAuthThemeConfig } from "@easyauth/frontend";

  export let status: EasyAuthClientStatus = "idle";
  export let title = "EasyAuth";
  export let message = "";
  export let theme: EasyAuthThemeConfig = {};

  let className = "";
  export { className as class };

  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: cardClass = createEasyAuthClassName("easyauth-card", resolvedTheme.classes.card, className);
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);
  $: visibleMessage = message || getDefaultMessage(status);

  function getDefaultMessage(currentStatus: EasyAuthClientStatus) {
    if (currentStatus === "loading") {
      return "Loading account state.";
    }

    if (currentStatus === "unauthenticated") {
      return "Sign in to create or retrieve your wallet.";
    }

    if (currentStatus === "error") {
      return "Something went wrong. Please try again.";
    }

    if (currentStatus === "funding_pending") {
      return "Funding is in progress.";
    }

    if (currentStatus === "funded") {
      return "Funding is complete.";
    }

    return "Ready.";
  }
</script>

<section class={cardClass} style={themeStyle}>
  <div class={createEasyAuthClassName("easyauth-row", resolvedTheme.classes.row)}>
    <slot name="header" {title} {status}>
      <h2 class={createEasyAuthClassName("easyauth-heading", resolvedTheme.classes.heading)}>{title}</h2>
    </slot>
    <slot name="badge" {status}>
      <span class={createEasyAuthClassName("easyauth-badge", resolvedTheme.classes.badge)}>{status}</span>
    </slot>
  </div>
  <slot name="message" {status} message={visibleMessage}>
    <p class={createEasyAuthClassName(status === "error" ? "easyauth-error" : "easyauth-text", status === "error" ? resolvedTheme.classes.error : resolvedTheme.classes.text)}>{visibleMessage}</p>
  </slot>
</section>
