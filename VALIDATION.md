# Delivery validation

Validated locally on October 12, 2026 (America/Indiana/Indianapolis).

| Check | Result |
|---|---|
| Backend regression and integration suite | 228 passed; three dependency deprecation warnings |
| Frontend ESLint | Passed |
| Next.js production build and TypeScript | Passed |
| Solidity Foundry suite | 12 passed; includes 256 fuzz runs |
| Real local-chain integration | Deploy, signed ALLOW and RESTRICT writes, successful receipts, access-state reads, wrong-chain rejection passed |
| Browser customer flow | Scenario A, real protected API content, C restriction passed |
| Browser employee flow | Login, case packet, simulated-incident review and audit passed |
| Browser signed-wallet flow | Injected provider with genuine EIP-191 signatures, analyst resolution, fresh proof and restored vault access passed |
| Browser layout | Desktop and 390px mobile inspected; no horizontal overflow or page exceptions |
| Public Monad RPC | eth_chainId returned 0x279f (10143) |
| Comment cleanup | 138 non-section Python comments removed; AST comparison confirmed unchanged Python semantics |

The trained artifact and earlier live Gemini reports remain under backend. The current 228-test run uses controlled fixtures and does not establish production detection accuracy. Local Anvil transaction evidence is in docs/local-chain-validation.json. No funded Monad transaction, hosting deployment, Docker build, independent security audit or portal submission was performed.

The backend tests include durable case/review reload, token exclusion from snapshots, grant revocation across reload, persistence-failure handling, signed reviewed recovery and replay rejection. These extend the existing feature, model, Gemini, poisoning, API and security regression tests.

## Aegis rename verification

On October 13, 2026, the Aegis rename passed all 228 backend tests, 12 contract tests, frontend lint and production build. The API proxy now uses /api/aegis; configuration uses AEGIS_ADMIN_KEY, AEGIS_EMPLOYEE_KEYS, AEGIS_REGISTRY_ADDRESS and AEGIS_API_URL. The existing GitHub repository URL is retained until the remote repository is renamed.
