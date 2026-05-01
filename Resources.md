# resources.md

## Current recommendation

For v1, the cleanest maintainable split is: **entity["company","Better Auth","typescript auth framework"]** for your app-level auth, sessions, and future email/password fallback; **entity["company","Google","internet services company"]** Identity Services for Google sign-in; **entity["company","Crossmint","wallet and onramp infra"]** for wallet provisioning plus fiat funding; official Solana docs for chain behavior and payment conventions; and either **entity["company","Helius","solana infra platform"]** or **entity["company","QuickNode","blockchain infra provider"]** once you want cleaner balance, transaction, and webhook infrastructure than generic public RPC gives you. Better Auth is framework-agnostic and has a first-party Fastify guide; Crossmint recommends bringing your own auth provider for production and can map your JWT user identity to wallet ownership; Solana’s official docs now have dedicated payments and on/off-ramp guidance. citeturn16view2turn16view1turn8search1turn8search0turn10search2turn4search3turn11search6turn12view1

The key architectural takeaway from the docs is this: **do not treat a Google user ID as wallet key material**. The portable pattern is to treat auth as identity, issue or verify a JWT/session, and let the wallet layer map that stable user identity to a wallet owner. Crossmint explicitly extracts the user ID from your JWT and assigns it to the wallet owner, while Privy and Coinbase CDP document the same custom-auth / JWT-based pattern, and Turnkey documents OAuth credentials plus embedded-wallet auth flows. That means you can keep your auth provider swappable without redesigning wallet custody later. This is an inference from the vendor docs, but it is the strongest one. citeturn8search0turn8search14turn14search10turn15search7turn14search0turn14search1

## LLM-first indexes

If you want an agent-friendly doc entry point first and the normal docs second, these are the best starting URLs.

- **Solana** — LLM index: `https://solana.com/llms.txt`; full snapshot: `https://solana.com/llms-full.txt`; docs home: `https://solana.com/docs`; payments hub: `https://solana.com/docs/payments`; on/off-ramp network: `https://solana.com/solanaramp`. Solana’s official `llms.txt` exposes the doc structure directly, including client SDKs, payments, RPC, and cookbook pages. citeturn0search0turn4search3turn4search9

- **Crossmint** — LLM index: `https://docs.crossmint.com/llms.txt`; docs home: `https://docs.crossmint.com/`; getting started: `https://docs.crossmint.com/introduction/getting-started`; API reference: `https://docs.crossmint.com/api-reference/introduction`. Crossmint’s docs repeatedly tell developers to fetch `llms.txt` as the documentation index. citeturn7search8turn6search0turn6search2turn6search6

- **Better Auth** — LLM index: `https://better-auth.com/llms.txt`; docs home: `https://better-auth.com/docs/introduction`; Fastify integration: `https://better-auth.com/docs/integrations/fastify`; MCP server reference is linked from the intro docs. Better Auth’s intro explicitly lists LLMs.txt and MCP as first-class AI resources. citeturn16view2turn16view1turn17search7

- **entity["company","Privy","wallet infrastructure company"]** — LLM index: `https://docs.privy.io/llms.txt`; full snapshot: `https://docs.privy.io/llms-full.txt`; docs home: `https://docs.privy.io/`; wallets overview: `https://docs.privy.io/wallets/overview`. Privy publishes both an index file and a full documentation snapshot. citeturn5view0turn5view1turn9search10

- **entity["company","Turnkey","wallet infrastructure company"]** — LLM index: `https://docs.turnkey.com/llms.txt`; full snapshot: `https://docs.turnkey.com/llms-full.txt`; docs home: `https://docs.turnkey.com/`; embedded wallet implementation guide: `https://docs.turnkey.com/production-checklist/embedded-wallet`. Turnkey’s LLM index is extensive and includes wallet creation, auth, policies, and SVM transaction APIs. citeturn5view2turn5view3turn14search1

- **entity["company","Dynamic","web3 wallet platform"]** — LLM index: `https://docs.dynamic.xyz/llms.txt`; docs home: `https://www.dynamic.xyz/docs`; Solana wallet docs: `https://www.dynamic.xyz/docs/react/wallets/using-wallets/solana/solana-wallets`. Dynamic’s `llms.txt` exposes both chain-specific and framework-specific docs. citeturn15search3turn4search4

- **QuickNode** — Solana LLM index: `https://www.quicknode.com/docs/solana/llms.txt`; docs root: `https://www.quicknode.com/docs/solana`. QuickNode exposes chain-specific `llms.txt` files rather than just one global index. citeturn11search1turn12view1

- **Helius** — docs root: `https://www.helius.dev/docs`; wallet API overview: `https://www.helius.dev/docs/wallet-api/overview`; balances API: `https://www.helius.dev/docs/wallet-api/balances`; webhooks: `https://www.helius.dev/docs/webhooks`. Search results also surfaced `https://www.helius.dev/llms.txt`, but direct retrieval in this session was inconsistent, so I would treat the docs root as the stable entry point for now. citeturn11search6turn11search8turn11search5turn11search2turn11search0turn12view0

## Auth and identity docs

For your actual app auth layer, these are the docs I would read in order.

- **Better Auth intro and Fastify integration** — `https://better-auth.com/docs/introduction` and `https://better-auth.com/docs/integrations/fastify`. These cover the exact backend shape you described earlier: a TypeScript auth framework with sessions, social sign-in, email/password, rate limiting, and a concrete Fastify route/handler pattern. citeturn16view2turn16view1

- **Better Auth Google provider** — `https://www.better-auth.com/docs/authentication/google`. This is the cleanest app-level Google auth doc if you do not want to wire raw OAuth yourself. It also supports signing in with a Google ID token, which is useful if you want the frontend to obtain the token first and the backend to finalize the session. citeturn17search0

- **Google OpenID Connect and button rendering** — `https://developers.google.com/identity/openid-connect/openid-connect`, `https://developers.google.com/identity/gsi/web/guides/display-button`, `https://developers.google.com/identity/gsi/web/reference/js-reference`, and the Google Identity hub at `https://developers.google.com/identity`. These are the authoritative references for claim validation, JWT handling, and the official Sign in with Google button/JavaScript API. citeturn2search0turn3search2turn3search6turn2search10

- **Crossmint auth overview and login methods** — `https://docs.crossmint.com/authentication/overview`, `https://docs.crossmint.com/authentication/login-methods`, `https://docs.crossmint.com/authentication/ssr`, and `https://docs.crossmint.com/authentication/user-profile`. Crossmint explicitly says its built-in auth is meant for staging and moving fast, and it recommends bringing your own auth provider for production. It also documents login-method configuration and SSR/session refresh behavior. citeturn8search1turn8search11turn8search9turn8search21

- **Crossmint BYO auth and identity mapping** — `https://docs.crossmint.com/wallets/guides/bring-your-own-auth` and `https://docs.crossmint.com/identity/register-user-data`. These two pages directly answer your “how does Google auth become wallet identity?” question: with BYO auth, Crossmint extracts the user ID from your JWT and assigns it to the wallet’s `owner`; if you manage IDs yourself, Crossmint documents `userId:<your-id>` as the owner format. citeturn8search0turn8search14

## Wallet creation and funding docs

These are the docs that map most directly to your MVP: login, create wallet, fund wallet, and show balance/status.

- **Crossmint wallet quickstart and wallet lifecycle** — `https://docs.crossmint.com/wallets/quickstarts/react`, `https://docs.crossmint.com/wallets/overview`, `https://docs.crossmint.com/api-reference/wallets/create-wallet`, and `https://docs.crossmint.com/sdk-reference/wallets/typescript/overview`. Crossmint’s React quickstart shows provider setup and notes that a wallet can be created automatically on login; the Create Wallet API is idempotent and returns the existing wallet when an owner already has one, which is exactly the behavior you want for long-term maintainability. citeturn8search3turn9search9turn9search15turn8search8

- **Crossmint onramp** — `https://docs.crossmint.com/onramp/overview`, `https://docs.crossmint.com/onramp/quickstarts/react`, `https://docs.crossmint.com/onramp/guides/onramp-to-external-wallets`, and `https://docs.crossmint.com/payments/advanced/webhooks`. Crossmint documents an embedded onramp flow where checkout handles KYC, payment, and delivery; if you onramp to wallets not created by Crossmint, there are extra identity-linking and ownership-verification steps; and webhooks let you track order/payment lifecycle events. citeturn8search7turn8search2turn0search1turn8search20

- **Crossmint signer caveat for Solana** — `https://docs.crossmint.com/wallets/concepts/signers` and `https://docs.crossmint.com/wallets/guides/error-handling`. These pages matter if you later add more advanced wallet controls: Crossmint notes that device signers are not currently supported for Solana wallets, and Solana wallets fall back to a recovery-signer path with more OTP friction. That is not a blocker for v1, but it is a real architecture caveat for v2. citeturn9search20turn9search23

- **Official Solana chain, SDK, and payments docs** — `https://solana.com/docs`, `https://solana.com/docs/core/accounts`, `https://solana.com/docs/clients/official/javascript`, `https://solana.com/docs/payments`, `https://solana.com/docs/payments/how-payments-work`, `https://solana.com/docs/payments/accept-payments`, and `https://solana.com/solanaramp`. These cover the canonical mental model for wallet addresses, token accounts, fees, SDK usage, merchant payments, and the official Solana on/off-ramp network. citeturn4search9turn3search7turn0search0turn10search2turn10search8turn10search1turn4search3

- **Wallet Standard and Wallet Adapter** — `https://github.com/anza-xyz/wallet-standard`, `https://anza-xyz.github.io/wallet-adapter/`, and `https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md`. These are the future-proofing docs if you later want users to connect Phantom or other external wallets alongside your embedded-wallet path. citeturn13search0turn13search3turn13search5

- **Solana Pay** — `https://solana.com/docs/payments/accept-payments/solana-pay`. Keep this in your folder, but treat it as **merchant checkout**, not card-to-crypto wallet funding. The official docs define Solana Pay as a payment-request URL/QR standard, not as a fiat onramp. citeturn10search0turn10search1

## Future-proof wallet alternatives

If you revisit this codebase later and want portability or vendor comparison without major refactors, these are the docs worth saving now.

- **Privy** — `https://docs.privy.io/wallets/overview`, `https://docs.privy.io/basics/react/quickstart`, `https://docs.privy.io/authentication/user-authentication/jwt-based-auth/overview`, `https://docs.privy.io/authentication/user-authentication/jwt-based-auth/setup`, `https://docs.privy.io/basics/react/advanced/automatic-wallet-creation`, `https://docs.privy.io/wallets/funding/overview`, and `https://docs.privy.io/recipes/solana/standard-wallets`. Privy supports Solana, automatic embedded-wallet creation on login, JWT-based auth with your own provider, funding flows, and Solana-standard-wallet integrations. citeturn9search10turn14search3turn14search10turn14search6turn14search11turn1search8turn9search6

- **Turnkey** — `https://docs.turnkey.com/production-checklist/embedded-wallet`, `https://docs.turnkey.com/authentication/overview`, `https://docs.turnkey.com/networks/solana`, `https://docs.turnkey.com/api-reference/activities/create-an-oauth-20-credential`, `https://docs.turnkey.com/products/embedded-wallets/features/fiat-on-ramp`, and `https://docs.turnkey.com/sdks/react/auth`. Turnkey is worth bookmarking if you later want a more composable wallet/auth platform with lower-level control, OAuth credentials, explicit Solana support, and even a fiat-onramp feature. citeturn14search1turn1search15turn9search3turn14search0turn1search12turn14search19

- **Dynamic** — `https://docs.dynamic.xyz/llms.txt` and `https://www.dynamic.xyz/docs/react/wallets/using-wallets/solana/solana-wallets`. Dynamic’s docs surface strong Solana embedded-wallet material and LLM/MCP-style tooling, which makes it a reasonable fallback if you want a more auth-first embedded-wallet stack later. citeturn15search3turn4search4

- **entity["company","Coinbase","crypto exchange company"]** CDP Embedded Wallets — `https://docs.cdp.coinbase.com/embedded-wallets/welcome`, `https://docs.cdp.coinbase.com/embedded-wallets/custom-authentication`, `https://docs.cdp.coinbase.com/embedded-wallets/react-hooks`, `https://docs.cdp.coinbase.com/embedded-wallets/solana-features/wallet-standard`, and `https://docs.cdp.coinbase.com/llms-full.txt`. Coinbase documents Solana embedded wallets, JWT-based custom auth, React hooks, and Wallet Standard integration. citeturn15search2turn15search7turn15search8turn4search5turn4search2

## RPC, balances, and later-stage auth docs

These are the supporting docs that matter once you move past the happy path.

- **Helius for balances and transaction monitoring** — `https://www.helius.dev/docs/wallet-api/overview`, `https://www.helius.dev/docs/wallet-api/balances`, and `https://www.helius.dev/docs/webhooks`. Helius documents a wallet API that returns balances, history, transfers, identity hints, and funding sources, plus real-time webhook support for Solana events. That is useful when your dashboard needs cleaner balance/status UX than vanilla RPC. citeturn11search8turn11search5turn11search2

- **QuickNode for RPC reference depth** — `https://www.quicknode.com/docs/solana/llms.txt` and `https://www.quicknode.com/docs/solana`. QuickNode’s Solana docs expose a very broad RPC and websocket surface, including `getBalance`, `getSignaturesForAddress`, `getSignatureStatuses`, and subscription methods. citeturn12view1turn11search1

- **Solana payment verification and indexing** — `https://solana.com/docs/payments/accept-payments/verification-tools` and `https://solana.com/docs/payments/accept-payments/indexing`. These are the official references for reconciling incoming payments and understanding when plain RPC polling stops being enough. citeturn10search6turn10search12

- **Later auth resources if you ever add password or phone** — Better Auth email/password: `https://www.better-auth.com/docs/authentication/email-password`; Better Auth email OTP: `https://better-auth.com/docs/plugins/email-otp`; Firebase web phone auth: `https://firebase.google.com/docs/auth/web/phone-auth`; Firebase auth limits: `https://firebase.google.com/docs/auth/limits`; Twilio Verify: `https://www.twilio.com/docs/verify/api` and verification endpoints: `https://www.twilio.com/docs/verify/api/verification`. Better Auth already supports email/password and email OTP; Firebase documents phone auth but also documents limits and pricing constraints; Twilio Verify is the more explicit phone/email verification API if you decide to pay for OTP infrastructure later. citeturn17search1turn17search12turn18search0turn18search1turn2search5turn18search2turn18search4

- **Twilio trial caveat if you test phone OTP later** — Twilio’s trial docs and Verify docs note that trial accounts have restrictions and that non-Twilio recipient numbers must be verified before you can send OTPs to them. That makes Twilio useful for controlled demos, but not a magic “free SMS auth” button. Docs: `https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account` and `https://www.twilio.com/docs/verify/api/verification`. citeturn2search6turn2search9
