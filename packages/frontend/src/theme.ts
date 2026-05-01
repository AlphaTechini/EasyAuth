export type EasyAuthThemeMode = "light" | "dark" | "system";

export interface EasyAuthThemeTokens {
  colorBackground?: string;
  colorSurface?: string;
  colorText?: string;
  colorMutedText?: string;
  colorPrimary?: string;
  colorPrimaryText?: string;
  colorBorder?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorDanger?: string;
  radius?: string;
  fontFamily?: string;
}

export interface EasyAuthClassOverrides {
  root?: string;
  heading?: string;
  text?: string;
  stack?: string;
  row?: string;
  button?: string;
  buttonPrimary?: string;
  buttonSecondary?: string;
  card?: string;
  modal?: string;
  modalPanel?: string;
  field?: string;
  badge?: string;
  error?: string;
  address?: string;
}

export interface EasyAuthThemeConfig {
  mode?: EasyAuthThemeMode;
  tokens?: EasyAuthThemeTokens;
  classes?: EasyAuthClassOverrides;
}

export type EasyAuthThemeTokenName = keyof EasyAuthThemeTokens;

export type EasyAuthClassSlot = keyof EasyAuthClassOverrides;

export type ResolvedEasyAuthThemeConfig = {
  mode: EasyAuthThemeMode;
  tokens: Required<EasyAuthThemeTokens>;
  classes: Required<EasyAuthClassOverrides>;
};

export const EASYAUTH_THEME_TOKEN_CSS_VARS = {
  colorBackground: "--easyauth-color-background",
  colorSurface: "--easyauth-color-surface",
  colorText: "--easyauth-color-text",
  colorMutedText: "--easyauth-color-muted-text",
  colorPrimary: "--easyauth-color-primary",
  colorPrimaryText: "--easyauth-color-primary-text",
  colorBorder: "--easyauth-color-border",
  colorSuccess: "--easyauth-color-success",
  colorWarning: "--easyauth-color-warning",
  colorDanger: "--easyauth-color-danger",
  radius: "--easyauth-radius",
  fontFamily: "--easyauth-font-family"
} as const satisfies Record<EasyAuthThemeTokenName, string>;

export const DEFAULT_EASYAUTH_THEME_TOKENS = {
  colorBackground: "#ffffff",
  colorSurface: "#ffffff",
  colorText: "#111111",
  colorMutedText: "#5f6368",
  colorPrimary: "#111111",
  colorPrimaryText: "#ffffff",
  colorBorder: "#d9dce1",
  colorSuccess: "#0f7b45",
  colorWarning: "#8a5a00",
  colorDanger: "#b42318",
  radius: "8px",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
} as const satisfies Required<EasyAuthThemeTokens>;

export const DEFAULT_EASYAUTH_CLASS_OVERRIDES = {
  root: "",
  heading: "",
  text: "",
  stack: "",
  row: "",
  button: "",
  buttonPrimary: "",
  buttonSecondary: "",
  card: "",
  modal: "",
  modalPanel: "",
  field: "",
  badge: "",
  error: "",
  address: ""
} as const satisfies Required<EasyAuthClassOverrides>;

export const DEFAULT_EASYAUTH_THEME = {
  mode: "system",
  tokens: DEFAULT_EASYAUTH_THEME_TOKENS,
  classes: DEFAULT_EASYAUTH_CLASS_OVERRIDES
} as const satisfies ResolvedEasyAuthThemeConfig;

export function defineEasyAuthTheme(theme: EasyAuthThemeConfig) {
  return theme;
}

export function resolveEasyAuthTheme(
  theme: EasyAuthThemeConfig = {}
): ResolvedEasyAuthThemeConfig {
  return {
    ...DEFAULT_EASYAUTH_THEME,
    ...theme,
    tokens: {
      ...DEFAULT_EASYAUTH_THEME.tokens,
      ...theme.tokens
    },
    classes: {
      ...DEFAULT_EASYAUTH_THEME.classes,
      ...theme.classes
    }
  };
}

export const mergeEasyAuthTheme = resolveEasyAuthTheme;

export function createEasyAuthThemeVars(theme: EasyAuthThemeConfig = {}) {
  const tokens = resolveEasyAuthTheme(theme).tokens;

  return Object.fromEntries(
    Object.entries(EASYAUTH_THEME_TOKEN_CSS_VARS).map(([tokenName, cssVar]) => [
      cssVar,
      tokens[tokenName as EasyAuthThemeTokenName]
    ])
  ) as Record<(typeof EASYAUTH_THEME_TOKEN_CSS_VARS)[EasyAuthThemeTokenName], string>;
}

export function createEasyAuthThemeStyle(theme: EasyAuthThemeConfig = {}) {
  return Object.entries(createEasyAuthThemeVars(theme))
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
}

export function createEasyAuthClassName(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}
