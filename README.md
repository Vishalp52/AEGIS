# AEGIS

We are building AEGIS to add behavioral security to wallet-based access. A signature proves control of a wallet. We also look at activity and access patterns before deciding whether a request should reach a protected resource.

**Try it:** https://aegis-web-8nd8.onrender.com/

**Employee console:** https://aegis-web-8nd8.onrender.com/employee

AEGIS brings together Dynamic wallet connection, Envio activity data, Alchemy verification, an Isolation Forest and deterministic rules. It can allow access, ask for another signature, send a case to an employee or restrict access. The employee console shows the evidence and provides a review and recovery process.

We want to develop this into an enterprise product that teams can use across private APIs and wallet-enabled applications. This release is our hackathon proof of concept. The website and backend are deployed, and Envio and Alchemy passed a combined live Monad Testnet check. Dynamic login is working; the complete user-controlled signing walkthrough is still pending. The model was trained on synthetic data, hosted Gemini generation has passed a live check, and the registry is tested locally but has no public deployment yet.

## Access for judges

The customer demo is public. For the employee console, use the judge key in the submission portal's **private Judge access instructions** field. Paste only the key into the sign-in form; there is no separate username. The judge login can view cases and make review decisions, but cannot run admin-only resets. Please use simulated cases when testing reviews.

For your own deployment, get `AEGIS_ADMIN_KEY` from the backend's private environment settings, or configure a separate `AEGIS_EMPLOYEE_KEYS` entry such as `judges:<a-random-private-key>`. The placeholder is not a working login. Keep real keys out of the repository and recording.

See the [user guide](docs/MONAD_GUIDE.md), [sponsor integrations](docs/SPONSOR_INTEGRATIONS.md) and [submission text](docs/SUBMISSION_COPY.md).

## Quick start in VS Code

Open this folder in VS Code. Use Python 3.14, Node.js 22, and npm. Run these commands from the repository root in the integrated terminal:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python scripts/setup.py --mode demo
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

On Windows PowerShell, replace the activation command with `.venv\Scripts\Activate.ps1`. In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open <http://localhost:3000>. Use the same hostname consistently; the frontend checks request origins. API documentation is at <http://localhost:8000/docs> in development.

The setup script creates private `backend/.env` and `frontend/.env.local` files with fresh random secrets. Existing files are preserved. For employee sign-in, open `backend/.env` locally and copy the value of `AEGIS_ADMIN_KEY`, or the key after `local:` in `AEGIS_EMPLOYEE_KEYS`. Do not paste keys into the README or commit them.

Demo mode needs neither a paid AI request nor a funded wallet. To verify a signature challenge, connect an injected Ethereum-compatible wallet before selecting a scenario. The app switches it to Monad Testnet. The demo uses simulated activity for the connected address.

## Customer and employee walkthrough

1. On the customer page select **Simulated replay**, then **A Normal wallet**. Request access to inspect the decision. On the hosted deployment, connect a wallet and prove ownership before opening the protected vault. The returned records are sample private API content.
2. Select **B Slight anomaly** to observe mild deviation; the result can be ALLOW or CHALLENGE depending on current history. If challenged, connect the same wallet used for the request and sign the fresh verification message.
3. Select **C Account-takeover style**. Its combined signals produce a hold. Open **Employee console**, sign in, and select the latest case.
4. Inspect the risk contributions, behavior against baseline, Gemini status, benign explanations, policy trace, timeline, and audit events. Save **SIMULATED_ATTACK** with an analyst note for replay evidence. This adds a reviewed signature and revokes existing grants for that wallet.
5. Run **E Pattern recurrence** and inspect its threat-memory match. Compare before and after confirming C when recording a demo. Use distinct replay wallets for this comparison.
6. Select **F Gemini unavailable**. The case shows the deterministic fallback, with no AI contribution. It still reaches an access decision.
7. For an identity recovery demonstration, use a separate unconfirmed C case created with your connected wallet. Save **CUSTOMER_VERIFIED** in the console. On the original customer tab, refresh review status, sign to restore access, and open the vault. A case already revoked by a confirmed incident cannot be reopened through this action.

**BENIGN** closes a review; it does not independently issue a grant. **CUSTOMER_VERIFIED** is the explicit identity recovery action. Customer access tokens stay in browser memory and disappear on refresh or wallet change. Cases remain in SQLite; start a new access request after reloading the customer page. Admin demo reset clears cases, attempts, reviews, incidents, nonces, and rate-limit state. It does not undo blockchain transactions. Keep demo and live databases separate.

## Architecture and scope

| Stage | Implementation |
|---|---|
| 1 Wallet and protected application | Dynamic wallet onboarding (injected-wallet fallback without a Dynamic ID), network check, EIP-191 nonce signatures, private vault API, customer recovery |
| 2 Activity collection | Envio indexed history with Alchemy block-hash corroboration and bounded RPC fallback, explicit partial-history provenance, reproducible replay |
| 3 Features | Eight-feature vector, baselines and deviations, application attempts plus chain activity |
| 4 Statistical detector | Seeded Isolation Forest, trained artifact, compatibility validation, calibration CLI |
| 5 Threat memory | Reviewed signatures, finite cosine similarity, provenance, durable reload, duplicate protection |
| 6 Gemini interpreter | Async GenerateContent, strict local schema, privacy-filtered evidence, bounded deadline and fallback |
| 7 Risk fusion | Validated weights, deterministic thresholds, capped AI contribution and corroboration rules |
| 8 Policy and enforcement | ALLOW / CHALLENGE / REVIEW / RESTRICT, scoped expiring tokens, signature verification, revocation and reviewed recovery |
| 9 Registry | Solidity oracle authorization, expiry, evidence hashes, backend signing, chain-ID check, receipt lookup and explorer links |
| 10 Investigation and delivery | Customer and employee interfaces, durable case packets and reviews, Docker files, CI, usage and submission instructions |

Request flow: browser → same-origin Next.js proxy → FastAPI → activity/features → detector/rules/memory/Gemini → deterministic policy → durable case → customer result. When configured, the backend signs a minimal registry update. The protected API verifies the token and current case state on every call.

The source keeps the original `backend/services + tests + scripts + config` directory because the compatibility loader imports it. Do not rename it without changing that loader. Comments are mostly section markers and tooling directives; behavior and limitations are documented here.

## Repository map

```text
backend/main.py               FastAPI application and lifecycle
backend/app/api/              Access, review, security, settings and persistence
backend/app/chain/            Monad, Envio, replay and registry adapters
backend/app/features/         Feature definitions, extraction and baselines
backend/app/models/           Detector, training and exported artifact
backend/app/ai/               Gemini client, prompt and schema
backend/app/db/               Durable case, evaluation, triage and review tables
backend/tests/                Backend regression and integration tests
backend/evaluation/           Prior model and live-provider evaluation evidence
frontend/app/                 Customer page, employee page and server routes
frontend/lib/                 API types, wallet signing and encrypted sessions
contracts/                    Foundry contract, deploy script and tests
scripts/setup.py              Private configuration generator
docs/                         Usage, submission and validation documents
compose.yaml                  Optional two-service local Docker deployment
.github/workflows/ci.yml       Backend, frontend and contract checks
```

## Configuration

### Backend

| Variable | Purpose |
|---|---|
| `APP_ENV` | `development` locally; `production` enables stricter startup/security defaults |
| `AEGIS_ADMIN_KEY` | Admin API key, including demo reset |
| `AEGIS_EMPLOYEE_KEYS` | Comma-separated `name:key` entries for analyst access |
| `TOKEN_SECRET` | Stable secret for expiring vault tokens; preserve across restarts |
| `DATABASE_URL` | SQLite default `sqlite:///./aegis.db`, resolved under backend |
| `REQUIRE_WALLET_SIGNATURE` | Set `true` for live use |
| `ENABLE_DEMO` | Set `false` for live use; use separate databases for replay |
| `DATA_SOURCE` | `none` for offline replay; `auto`, `rpc`, or `envio` for collection |
| `ALCHEMY_RPC_URL` | Private Alchemy endpoint; takes precedence over the public Monad RPC and corroborates indexed history |
| `MONAD_RPC_URL` / `MONAD_CHAIN_ID` | Default testnet RPC and chain `10143`; writer rejects a mismatch |
| `RPC_SCAN_BLOCKS` | Bounded scan size, default 150; this is not full wallet history |
| `ENVIO_HYPERSYNC_URL` / `ENVIO_API_TOKEN` | Optional indexed chain source |
| `GEMINI_MODE` | `mock` for replay, `auto` for real provider, `off` for fallback |
| `GEMINI_API_KEY` | Server-only provider key; `GOOGLE_API_KEY` accepted as fallback |
| `GEMINI_MODEL` | Default `gemini-3.5-flash-lite`; configurable by account availability |
| `GEMINI_TIMEOUT_SECONDS` | 12 seconds; errors and timeout use deterministic fallback |
| `GEMINI_THINKING_LEVEL` | `low` by default; `default` omits it for incompatible models |
| `AEGIS_REGISTRY_ADDRESS` / `ORACLE_PRIVATE_KEY` | Optional deployed contract and funded authorized oracle; both required for writes |
| `RATE_LIMIT_PER_MINUTE` | Default 30; development demos can raise it temporarily |
| `TRUST_PROXY_HEADERS` | Leave false unless your controlled reverse proxy sanitizes forwarding headers |
| `ALLOWED_HOSTS` / `CORS_ORIGINS` | Restrict to the actual deployment hosts and frontend origin |

See `backend/.env.example` for remaining timeouts and limits. Keep all private keys server-side. For live collection, edit the existing file; running setup again deliberately does not change it.

### Frontend

| Variable | Purpose |
|---|---|
| `DYNAMIC_ENVIRONMENT_ID` | Public runtime environment ID; enables Dynamic onboarding and signing |
| `AEGIS_API_URL` | Server-only backend URL; local default `http://127.0.0.1:8000` |
| `APP_ORIGIN` | Exact browser origin; local `http://localhost:3000` |
| `SESSION_SECRET` | At least 32 characters for AES-GCM employee sessions |
| `COOKIE_SECURE` | `false` only on local HTTP; set `true` on hosted HTTPS |
| `NEXT_PUBLIC_MONAD_CHAIN_ID` | Build-time wallet network; `10143` for testnet |

The employee key is sealed in an expiring HTTP-only, SameSite Strict cookie. Browser scripts cannot read it. The proxy allows only defined API routes, enforces Origin on mutations, and forwards employee credentials only on employee routes. API and oracle secrets must never use a `NEXT_PUBLIC_` name.

## Risk model and AI behavior

Default fusion weights are anomaly 45%, rules 25%, reviewed similarity 15%, and Gemini semantic risk 15%. The AI contribution is capped at 20 points even with a changed configuration. When AI is unavailable, deterministic terms are renormalized. Thresholds are ALLOW 0–34, CHALLENGE 35–54, REVIEW 55–74, and RESTRICT 75–100, subject to policy guardrails. Configuration lives in `backend/services + tests + scripts + config/config/risk.yaml`.

The included Isolation Forest was trained on 1,000 supplied synthetic normal wallets. The calibration split uses 800 training and 200 normal holdout rows; the final artifact uses all 1,000. This is normal-only calibration, not validated attack detection accuracy. Gemini is an external pretrained model and is not fine-tuned by this project.

Prior live Gemini evaluation in `backend/evaluation/live-report.json` accepted all 25 structured responses and matched 19 of 25 fixture categories. These are development fixtures. Current full-project browser tests use deterministic mock triage; they are not fresh live-provider accuracy tests. Partial chain history, sparse wallets, quota failures and provider outages are surfaced or routed conservatively.

```bash
# Run from the repository root with the virtual environment active
python backend/model.py --report backend/evaluation/model-report.json
python -m pytest -q
cd backend
python evaluate.py --output evaluation/offline-report.json
# Optional billable provider check after configuring a key
python evaluate.py --live --limit 1 --output evaluation/live-smoke.json
```

## API reference

Development OpenAPI at `/docs` is the complete schema reference. Send `X-API-Key` for employee/admin routes and `Authorization: Bearer <token>` only to the protected vault.

| Method and route | Access and behavior |
|---|---|
| `GET /health` | Public minimal health |
| `GET /health/details` | Employee configuration and component health |
| `GET /auth/nonce?wallet=0x...` | Fresh wallet-bound message for an access request |
| `POST /access/request` | Wallet, resource_id, action, nonce and signature; optional demo_scenario in demo mode |
| `GET /customer/status/{request_id}` | Minimal customer status without analyst evidence |
| `GET /access/{request_id}/challenge` | Fresh challenge message |
| `POST /access/{request_id}/verify` | Verify nonce and signature, issue scoped grant |
| `GET /access/{request_id}/resume` | Fresh proof for analyst-resolved access |
| `POST /access/{request_id}/resume` | Verify proof before returning a recovered grant |
| `GET /vault/research-vault` | Bearer token, expiry and revocation checked |
| `GET /cases` and `/cases/{case_id}` | Employee list and full investigation packet |
| `POST /cases/{case_id}/review` | Employee disposition and note |
| `POST /cases/{case_id}/registry` | Employee refresh of submitted transaction receipt |
| `POST /incident/confirm` and `GET /incidents` | Reviewed threat-memory management |
| `GET /wallet/{wallet}/features` and `/risk` | Employee feature/risk inspection |
| `POST /score` | Employee scoring route |
| `GET /demo/scenarios` | Replay metadata when demo enabled |
| `POST /demo/reset` | Admin-only reset when demo enabled |

Example offline access request while demo mode is enabled:

```bash
curl http://localhost:8000/access/request \
  -H 'Content-Type: application/json' \
  -d '{"wallet":"0x000000000000000000000000000000000000a00a","resource_id":"research-vault","action":"read","demo_scenario":"A"}'
```

## Persistence and security boundaries

SQLite stores case snapshots plus normalized features, evaluations, AI triage, employee reviews, access attempts, reviewed incidents and audit records. Bearer tokens are excluded from persisted case responses. Cases and revocation state reload on startup. Nonces and rate limits are process-local; run **one backend worker and one replica**. This is a bounded proof of concept, not a horizontally scalable authorization service. Back up the database volume and retain the token secret together.

The registry is an asynchronous evidence mirror. API authorization uses the backend policy and case state; a submitted transaction does not mean it is confirmed. Employee review and challenge recovery do not automatically replace an earlier on-chain risk evaluation. A fresh evaluation publishes a new record. Do not use this registry as a production revocation oracle without adding a durable ordered outbox, reconciliation, and review-update semantics. The contract keeps the latest oracle-written record per wallet; it has no independent model verification.

A configured single oracle can write records; the owner can rotate it and transfer ownership with two-step acceptance. Only scores, decision, expiry and a hash go on chain; full evidence stays in the database. Demo registry writes, if enabled, must use a separate testnet contract. The public source archive excludes credentials and databases. The separate private archive contains your configured secrets and must not be uploaded to GitHub or the submission portal.

## Tests and deployment

```bash
python -m pytest -q
cd frontend
npm ci
npm run lint
npm run build
cd ../contracts
forge test
```

Our latest backend run on October 13 passed 292 tests, including the section 7 fixes. All 20 frontend tests, lint and the production build passed. Earlier checks passed 12 contract tests (including 256 fuzz runs), frontend tests, lint and a production build. Browser workflows and local chain integration are recorded in [VALIDATION.md](VALIDATION.md).

For containers, run `python scripts/setup.py --mode demo`, then `docker compose up --build` from the root. The compose file binds to localhost, stores SQLite in a named volume, and runs one backend process. The Docker services build and run on Render; Docker was not available for a local container check. For hosting, use HTTPS, set the frontend's exact `APP_ORIGIN`, set `COOKIE_SECURE=true`, configure private environment variables, expose only the frontend publicly where possible, and attach durable backend storage. Do not use an ephemeral filesystem for the database. Follow the [Monad guide](docs/MONAD_GUIDE.md) for funded testnet deployment and submission.

## GitHub from VS Code

Use the **public source** folder. If copying into an existing checkout, keep that checkout's `.git` directory and remote. Review `git status` before staging. For a new extracted folder:

```bash
git init
git add .
git status --short
git commit -m "Complete AEGIS application, registry and documentation"
git branch -M main
git remote add origin https://github.com/Vishalp52/AEGIS.git
git push -u origin main
```

If the remote already has commits, clone it first and copy the completed source into that checkout, excluding `.git`, then commit and push from there. Do not force-push to bypass a rejected history. If `origin` already exists, inspect `git remote -v` instead of adding it again. `.env`, `.env.local`, SQLite files, build output and ZIPs are ignored. Inspect the staged files to confirm only public source is included.

## Troubleshooting

- **Service offline:** start the backend and check `AEGIS_API_URL`; use `cd backend` before `uvicorn main:app`.
- **Origin not allowed:** match `APP_ORIGIN` to the exact browser scheme, hostname and port, then restart Next.js.
- **Sign-in fails:** use the key value, not the `AEGIS_ADMIN_KEY=` prefix; verify that backend and frontend point to the same instance.
- **Wallet mismatch:** reconnect the original wallet and correct network. A replay started without a wallet cannot be signed by an unrelated account; connect first and rerun it.
- **429:** wait for the rate-limit window or use a larger local development limit. Do not disable limits on a public deployment.
- **Gemini fallback:** check mode, model availability, quota and provider key. A fallback decision is expected behavior, not automatic access approval.
- **Registry skipped:** both the address and oracle key are required. **Failed:** verify chain ID, oracle address, funding and deployed bytecode. **Submitted:** refresh the receipt after confirmation.
- **Restored access denied:** expired or revoked cases require a fresh evaluation; confirmed incidents cannot be undone by a customer signature.
- **Unexpected replay results:** history affects features. Reset a dedicated demo database before recording comparable runs.

## Latest wallet and API audit

See [the October 13 wallet and API check](docs/API_WALLET_CHECK.md) for earlier wallet and API fixes and signed test-wallet browser results. The newer sponsor work brings the backend suite to 292 tests. Run `npm test` from frontend to execute the wallet and proxy regression tests. Wallet extensions must be installed in the browser opening the site; embedded app browsers may not expose them.

The hosted Gemini integration passed a real generation check on October 13 with mode `auto` and `gemini_status: ok`. Earlier provider outages exercised the deterministic fallback. GitHub Actions has a manual **Live Gemini API check** workflow using the encrypted `GEMINI_API_KEY` repository secret so generation can be rechecked without committing credentials. This secret must also be configured separately in a hosting platform's private backend environment.

## Visual identity

The AEGIS identity uses an original geometric A, a custom vector wordmark, near-black surfaces and an electric-green accent. Website assets are in `frontend/public/brand`, with the browser icon in `frontend/app/icon.svg`. The upload-ready 1200 × 1200 PNG and editable SVG are in `docs/submission`. The customer and employee interfaces share the same identity. The submission pack in that folder includes entry copy, recording scripts and readiness checks; deployment and live-provider limitations still apply.

## Public hosting

Use the root `render.yaml` to create a public website, private backend and persistent case disk on Render. See [hosting instructions](docs/HOSTING.md). Our public website and private backend are already deployed with persistent case storage. The hosted app uses real Gemini interpretation when triggered and requires wallet signatures. Replay activity remains labeled as simulated. Public registry deployment is still pending.

## Sponsor integrations

Envio indexed wallet history, Alchemy RPC corroboration and Dynamic wallet signing are documented in [the sponsor setup and verification guide](docs/SPONSOR_INTEGRATIONS.md). All three integrations are configured. The combined Envio/Alchemy live check passed; the complete Dynamic signing walkthrough remains pending. The live website is https://aegis-web-8nd8.onrender.com.

## Section 7 updates

We merged `monish/section7-on-main`: score boundaries now use consistent half-up rounding, invalid risk settings fail early, uncertain AI cannot override a restriction supported by deterministic evidence, and an active restriction lasts until expiry or analyst resolution. Decision records include more explanation, and employee sign-in refuses a backend with no configured keys.
