<script lang="ts">
  import "../styles/easyauth.css";
  import { writable } from "svelte/store";
  import { setEasyAuthClient } from "../../dist/ui-context.js";
  import {
    createEasyAuthClassName,
    createEasyAuthThemeStyle,
    resolveEasyAuthTheme
  } from "../../dist/theme.js";
  import type { EasyAuthFrontendClient, EasyAuthThemeConfig } from "@easyauth/frontend";

  export let client: EasyAuthFrontendClient | null = null;
  export let theme: EasyAuthThemeConfig = {};

  let className = "";
  export { className as class };

  const clientStore = writable<EasyAuthFrontendClient | null>(client);
  setEasyAuthClient(clientStore);

  $: resolvedTheme = resolveEasyAuthTheme(theme);
  $: rootClass = createEasyAuthClassName("easyauth-root", resolvedTheme.classes.root, className);
  $: themeStyle = createEasyAuthThemeStyle(resolvedTheme);

  $: clientStore.set(client);
</script>

<div class={rootClass} style={themeStyle}>
  <slot />
</div>
