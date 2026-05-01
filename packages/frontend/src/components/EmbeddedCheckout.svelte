<script lang="ts">
  import { onMount } from "svelte";
  import "../styles/easyauth.css";
  import type { EasyAuthFundingOrder } from "@easyauth/shared";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthThemeConfig } from "@easyauth/frontend";

  export let fundingOrder: EasyAuthFundingOrder | null = null;
  export let clientApiKey: string | undefined = undefined;
  export let title = "Complete funding";
  export let payment = {
    crypto: { enabled: false },
    fiat: { enabled: true },
    defaultMethod: "fiat"
  };
  export let theme: EasyAuthThemeConfig = {};
  export let onReady: () => void = () => {};
  export let onError: (error: unknown) => void = () => {};

  let className = "";
  export { className as class };

  let mountElement: HTMLDivElement;
  let mounted = false;
  let renderedKey = "";
  let root: { render(node: unknown): void; unmount(): void } | null = null;
  let loadError: unknown = null;

  const dynamicImport = new Function("specifier", "return import(specifier)") as <
    TModule
  >(
    specifier: string
  ) => Promise<TModule>;

  $: checkout = fundingOrder?.embeddedCheckout ?? null;
  $: resolvedClientApiKey = clientApiKey ?? checkout?.clientApiKey;
  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: cardClass = createEasyAuthClassName(
    "easyauth-card easyauth-checkout-shell",
    resolvedTheme.classes.card,
    className
  );
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);
  $: checkoutKey = checkout
    ? `${checkout.orderId}:${checkout.clientSecret}:${resolvedClientApiKey ?? ""}`
    : "";
  $: if (mounted) {
    void renderCrossmintCheckout(checkoutKey);
  }

  onMount(() => {
    mounted = true;
    void renderCrossmintCheckout(checkoutKey);

    return () => {
      unmountCheckout();
    };
  });

  async function renderCrossmintCheckout(key: string) {
    if (key === renderedKey) {
      return;
    }

    renderedKey = key;
    unmountCheckout();
    loadError = null;

    if (!checkout || !resolvedClientApiKey || !mountElement) {
      return;
    }

    try {
      const React = await dynamicImport<{
        createElement(type: unknown, props?: Record<string, unknown>, ...children: unknown[]): unknown;
      }>("react");
      const ReactDomClient = await dynamicImport<{
        createRoot(container: Element): { render(node: unknown): void; unmount(): void };
      }>("react-dom/client");
      const Crossmint = await dynamicImport<{
        CrossmintProvider: unknown;
        CrossmintEmbeddedCheckout: unknown;
      }>("@crossmint/client-sdk-react-ui");

      root = ReactDomClient.createRoot(mountElement);
      root.render(
        React.createElement(
          Crossmint.CrossmintProvider,
          { apiKey: resolvedClientApiKey },
          React.createElement(Crossmint.CrossmintEmbeddedCheckout, {
            orderId: checkout.orderId,
            clientSecret: checkout.clientSecret,
            payment: {
              ...payment,
              receiptEmail: checkout.receiptEmail
            }
          })
        )
      );
      onReady();
    } catch (error) {
      loadError = error;
      onError(error);
    }
  }

  function unmountCheckout() {
    root?.unmount();
    root = null;
  }
</script>

<section class={cardClass} style={themeStyle}>
  <slot name="header" {title} {fundingOrder}>
    <div class={createEasyAuthClassName("easyauth-row", resolvedTheme.classes.row)}>
      <h2 class={createEasyAuthClassName("easyauth-heading", resolvedTheme.classes.heading)}>{title}</h2>
      {#if fundingOrder}
        <span class={createEasyAuthClassName("easyauth-badge", resolvedTheme.classes.badge)}>{fundingOrder.status}</span>
      {/if}
    </div>
  </slot>

  {#if checkout}
    {#if resolvedClientApiKey}
      <div class="easyauth-checkout-mount" bind:this={mountElement}></div>
    {:else}
      <slot name="missing-client-key" {fundingOrder}>
        <p class={createEasyAuthClassName("easyauth-error", resolvedTheme.classes.error)}>
          Crossmint client API key is required to render embedded checkout.
        </p>
      </slot>
    {/if}
  {:else}
    <slot name="empty" {fundingOrder}>
      <p class={createEasyAuthClassName("easyauth-text", resolvedTheme.classes.text)}>
        Create a funding order before opening checkout.
      </p>
    </slot>
  {/if}

  {#if loadError}
    <slot name="error" error={loadError}>
      <p class={createEasyAuthClassName("easyauth-error", resolvedTheme.classes.error)}>
        Embedded checkout could not be loaded.
      </p>
    </slot>
  {/if}
</section>
