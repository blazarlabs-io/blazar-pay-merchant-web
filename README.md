# Blazar Pay merchant web

Next.js dashboard for merchants of the Hydra contactless micropayments system.

## Milestone 3: receiving ADA, USDM and BTC payments (testnet)

The merchant web is the merchant side of the M3 demo. It works only on **Cardano preprod** (BTC comes from **Bitcoin testnet3** through the WanBridge testnet) against the custodial demo backend `https://blazar-api.cardano.vip` (`blazar-hydra`). The payer uses the mobile app (`blazar-pay-mobile-app`) and the phone gets the request from the terminal (`blazar-pay-termial`) by tapping its NFC tag or over BLE. Test accounts are provided on request.

### Receive-payment flow
1. The merchant signs in (Firebase) and connects the CIP-30 wallet whose address is mapped to the merchant account in the backend. The backend rejects a request for any other address (403).
2. Dashboard → "Receive": pick the asset (ADA, USDM or BTC), type the amount in display units (ADA and USDM 6 decimals, BTC 8; use a dot as the decimal separator) and press "Request". The amount is converted to an integer string in base units without floats; invalid input is shown and never sent. The button is disabled while the request is in flight.
3. The browser calls `POST /api/hydra/payments`, and the server creates the backend `Payment` (`created`, expires after 120 s). A new request expires the merchant's previous unpaid one, so the terminal always shows the latest request.
4. The terminal picks the request up (`GET /terminal/pending-payment`), the payer's phone gets it by tapping the terminal's NFC tag (`GET /terminals/:id/pending-payment`) or over BLE, and authorizes it.
5. The widget polls `GET /api/hydra/payments/<paymentId>` every 1 s until `confirmed`, `failed` or `expired`, and shows the amount, state, Hydra tx id, snapshot number and error. Success is shown only for `confirmed`, which the backend sets only after the Hydra snapshot containing the transaction is confirmed. On `confirmed` the balances refresh. "New request" starts over.

The first payment to a merchant in a Hydra head must be at least 2 ADA (one-time bootstrap); before it, other payments fail with `MERCHANT_NOT_BOOTSTRAPPED`. "Send payment" is hidden in this version.

### Server proxy `/api/hydra/payments`
| Route | Backend call | Checks |
|---|---|---|
| `POST /api/hydra/payments` | `POST {HYDRA_API_URL}/payments` | Signed-in user (`withAuth`); body `{merchantAddress, assetUnit, amountBaseUnits}` must pass the shared contract schema (known asset, positive integer string), otherwise 400 without calling the backend |
| `GET /api/hydra/payments/[id]` | `GET {HYDRA_API_URL}/payments/:id` | Signed-in user; the id must be a UUID (400 otherwise) |

The proxy forwards the merchant's verified Firebase ID token as `Authorization: Bearer`; the backend verifies it and maps it to the merchant account, so no extra API key is needed. Backend statuses (400/403/404/409/410/503) are passed through with a generic body, and an unreachable backend or a response that fails the `Payment` schema gives 502. The shared types are in `src/types/payment-contract.ts`.

### Balances
For each asset the dashboard shows two rows that are never added together:
- "`<asset>` L2": what the merchant has received inside the Hydra head (`totalInL2` from `GET /query-funds`). `payableInL2` covers user funds only, so it is always empty for a merchant.
- "`<asset>` L1": funds on Cardano L1 (`totalInL1`).

The USD total counts the L2 amounts only and is for display.

### Environment variables
Copy `.env.example` to `.env.local` and fill in the values (names only here; never commit them). The server variables are validated in `src/lib/env.ts`.

| Group | Variables |
|---|---|
| Backend | `HYDRA_API_URL` (e.g. `https://blazar-api.cardano.vip`) |
| Firebase client (same project as the backend and the mobile app) | `NEXT_PUBLIC_FB_API_KEY`, `NEXT_PUBLIC_FB_AUTH_DOMAIN`, `NEXT_PUBLIC_FB_PROJECT_ID`, `NEXT_PUBLIC_FB_STORAGE_BUCKET`, `NEXT_PUBLIC_FB_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FB_APP_ID`, `NEXT_PUBLIC_FB_MEASUREMENT_ID` |
| Firebase Admin (server only) | `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` |
| Cardano | `CARDANO_NETWORK`, `BLOCKFROST_PROJECT_KEY`, `NEXT_PUBLIC_BLOCKFROST_PROJECT_KEY`, `TX_SIGN_KEY`, `LIVE_COIN_WATCH_API_KEY` |
| Other services | `APP_URL`, `CAPTCHA_SITE_KEY`, `CAPTCHA_SECRET_KEY`, `GOOGLE_MAPS_API_KEY`, `QR_CODES_URL`, `SENDGRID_API_KEY`, `TRACECORK_EMAIL`, `SANITY_PROJECT_ID`, `SANITY_TOKEN`, `SANITY_DATASET` |

### Run locally
```bash
pnpm install
cp .env.example .env.local      # then fill in the values
pnpm dev                        # http://localhost:3000
```
If `pnpm install` stops on ignored build scripts and edits `pnpm-workspace.yaml`, restore that file with `git checkout pnpm-workspace.yaml`; the binaries can also be called directly (`./node_modules/.bin/next dev`).

Tests: `pnpm test:run` (vitest; 103 tests, including base-unit conversion, proxy validation with a mocked backend and the 1 s polling). Type check: `pnpm type-check`.

### Verified on preprod
The backend flow used by this dashboard was run live on 9 to 10 October 2026: a 2 ADA bootstrap, a 5 ADA payment and a 0.0001 BTC payment, each confirmed in a Hydra snapshot, with the payer and the merchant reading the same `confirmed` record (ids in `doc/m3-payments-and-btc.md` of `blazar-hydra`). That run showed that `payableInL2` is always empty for a merchant, which is why the L2 row now shows `totalInL2`. Screenshots of this dashboard during a live payment are still to be taken.

### Known limitations
- Testnet/preprod only; custodial demo backend. One merchant, one terminal.
- The deployed Hydra validator does not enforce the payer's signature; the payer's consent is the authenticated `authorize` call from the phone.
- Contactless transport: a static NFC tag on the terminal (`myapp://home/nfc?terminal=<id>`), with BLE as the alternative. NFC on iPhone needs a paid Apple developer team.
- No BTC cash-out.
- The terminal status indicator in the sidebar is not driven by the M3 flow and stays "disconnected".

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

To create [API routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) add an `api/` directory to the `app/` directory with a `route.ts` file. For individual endpoints, create a subfolder in the `api` directory, like `api/hello/route.ts` would map to [http://localhost:3000/api/hello](http://localhost:3000/api/hello).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn/foundations/about-nextjs) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_source=github.com&utm_medium=referral&utm_campaign=turborepo-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## License

The project's original source code is licensed under the [Apache License 2.0](LICENSE), consistent with the Project Catalyst 1200128 open-source commitment. See [NOTICE](NOTICE) for attribution and scope. Third-party dependencies, bundled third-party assets and files with separate licence notices retain their respective licences.
