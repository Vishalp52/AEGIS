# Envio, Alchemy and Dynamic

The Envio and Alchemy combined pipeline passed local and hosted live Monad Testnet checks on October 13, 2026. Dynamic account configuration is complete; hosted wallet signing and protected vault access passed a live Safari/MetaMask walkthrough. Do not claim bounty eligibility from installed packages, mocked tests or simulated replay alone. The deployed site is https://aegis-web-8nd8.onrender.com and the repository is https://github.com/Vishalp52/AEGIS.

## Account setup

Create the accounts yourself and use free options where available. No paid sponsor subscription is required by this code.

| Service | Account setup | Render service | Environment variable |
| --- | --- | --- | --- |
| Envio | https://envio.dev/app/api-tokens | aegis-api | `ENVIO_API_TOKEN` and `ENVIO_HYPERSYNC_URL=https://monad-testnet.hypersync.xyz` |
| Alchemy | https://dashboard.alchemy.com/ — create an app with Monad Testnet enabled and copy its HTTPS RPC URL | aegis-api | `ALCHEMY_RPC_URL` |
| Dynamic | https://app.dynamic.xyz/ — create an environment and copy its environment ID | aegis-web | `DYNAMIC_ENVIRONMENT_ID` |

Keep tokens and the Alchemy URL in private Render environment settings or ignored local environment files. The Dynamic environment ID is public configuration and is intentionally sent to the browser. A Dynamic server API key is not needed.

In Dynamic, enable Ethereum-compatible wallets and Monad Testnet (10143). Add `https://aegis-web-8nd8.onrender.com` to the allowed origins, plus `http://localhost:3000` for local testing. For email/embedded-wallet onboarding, enable that feature in the Dynamic dashboard and test it before describing it in the submission. Do not enable account abstraction: the backend currently verifies standard EIP-191 EOA signatures, not EIP-1271 contract-wallet signatures.

Save and redeploy the affected Render services. Keep `DATA_SOURCE=auto`, `MONAD_CHAIN_ID=10143`, and `REQUIRE_WALLET_SIGNATURE=true`. Dynamic configuration is read at server runtime, so it does not require a public build-time key. With no Dynamic ID, the existing browser-extension connection stays available.

## How each service is used

Envio HyperSync retrieves incoming and outgoing transactions over a timestamp-bounded 24-hour window and looks up first activity. The adapter handles pagination, duplicate self-transfers, stale indexes and incomplete data. These transactions become behavioral features consumed by AEGIS's rules and anomaly model. Simulated replay bypasses the live providers and does not prove this integration.

Alchemy supplies Monad JSON-RPC. When both providers are configured, AEGIS checks the chain ID and corroborates the Envio indexed head's block hash through Alchemy before accepting its history. It also reads the wallet nonce. A failed check falls back to a bounded Alchemy scan, explicitly marked as incomplete history. Alchemy is also the RPC transport for registry submissions when the registry and signing key are separately configured. Merely enabling Alchemy does not deploy that contract.

Dynamic supplies wallet selection, connection and message signing. Its selected wallet signs the backend's nonce and subsequent challenge or recovery messages. AEGIS still verifies those signatures on the backend before issuing access. Account, network and logout events clear the vault UI; signing checks the current network and account before and after wallet approval. Dynamic authentication alone never grants vault access.

## Verification and submission evidence

1. Run backend tests and frontend tests, lint and production build.
2. Set the private local backend variables and run `python scripts/check_sponsors.py --wallet YOUR_PUBLIC_MONAD_WALLET`. Use an active wallet and preserve the credential-free output. It must show Envio history, successful Alchemy corroboration and derived features. Missing tokens or failed calls are not a pass.
3. On the hosted site, use **Live wallet**, connect through Dynamic, select Monad Testnet, request access and sign the real nonce. Complete any challenge. Demonstrate that a successful approval can open the vault.
4. Switch accounts and networks and sign out. Confirm prior vault contents disappear. Cancel a signature and verify no access is granted.
5. In the employee console, inspect the request evidence: the source must be `envio`, the notes must show Alchemy corroboration, and the request must not be simulated. A source of `alchemy` is a partial fallback and does not demonstrate Envio.
6. Record the working interaction and retain the public demo link, repository link and provider evidence. Complete each bounty's actual portal questions only after the corresponding test passes.

The main submission still needs its demo and pitch videos. Do not describe the prototype as audited or production-ready. Sponsor eligibility remains subject to the organizers' rules and review.

## Source references

- Envio query client: `backend/app/chain/envio.py`; orchestration: `backend/app/chain/source.py`.
- Alchemy RPC and registry: `backend/app/chain/monad_rpc.py`, `backend/app/chain/registry.py`.
- Dynamic connection: `frontend/components/dynamic-home.tsx`; guarded signing: `frontend/lib/dynamic-signing.ts`.
- Envio official networks: https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks
- Alchemy Monad quickstart: https://www.alchemy.com/docs/reference/monad-api-quickstart
- Dynamic SDK: https://docs.dynamic.xyz/react-sdk/providers/dynamiccontextprovider

## Dependency review

The Dynamic SDK is pinned to 5.10.0. Axios and sharp are overridden to patched releases. The dependency audit still reports upstream advisories, including bigint-buffer, uuid, braces and stream-json, and a Dynamic Base Account connector peer-version warning. Do not treat a successful build as a security audit or market this deployment as production-ready. Review upstream fixes and the deployed bundle before enterprise rollout. npm/package-lock.json is the supported dependency workflow; the obsolete pnpm lockfile was removed.

## Live provider check — October 13, 2026

The check used public wallet `0x4edf4af8fbd55409ddeb326b91248896554fce0f`: HyperSync returned three transactions in a complete 24-hour window; Alchemy confirmed chain 10143, the indexed block hash and wallet nonce 2. The combined pipeline reported source `envio`, normal history confidence and derived behavioral features. All 237 backend tests passed. This is local provider evidence, not yet a hosted wallet-signing demonstration.

Queries request compact function selectors instead of full transaction calldata. Retrieval remains bounded to 20 pages; extremely active wallets can exceed that limit and use the explicitly partial RPC fallback.

Dynamic uses the AEGIS Sandbox environment with Monad Testnet enabled and the hosted AEGIS origin allowed. No paid Dynamic plan or gas sponsorship was enabled.
