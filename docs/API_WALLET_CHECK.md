# Wallet and API verification

Checked October 13, 2026. The backend passes 231 tests, including fresh checks that expired and revoked challenges cannot issue access and analysts cannot mark revoked grants restored. The frontend has 11 automated wallet and API tests, and passes lint and a production build.

## Fixes

Wallet connection requests account permission before switching networks, explicitly switches after adding Monad, and verifies the resulting chain. Cancelled requests, pending approval and missing browser extensions have actionable errors. Signing checks the selected account and chain before and after wallet approval. Customer state discards delayed access, review and vault responses after wallet or network changes; disconnect clears access.

The API proxy returns HTTP 413 for oversized requests. Employee sign-in returns HTTP 400 for malformed JSON and invalid payloads. The browser client preserves Headers objects and reports non-JSON gateway failures without exposing a JSON parser error. Expired and revoked challenge endpoints reject requests before consuming a proof or issuing a grant, with verification serialized against review changes.

## Browser checks

An isolated backend and built frontend exercised wallet connection through an injected provider, genuine EIP-191 signatures, suspicious access, analyst identity approval, a fresh recovery signature, protected vault access and oversized-body rejection. A delayed response check changed the wallet while evaluation was pending and confirmed that stale access did not reappear. These are browser integration tests with an injected test wallet, not a claim that every third-party wallet extension has been certified.

## Live Gemini result

The former credential returned HTTP 401. The replacement key successfully listed supported models (HTTP 200). Generation returned HTTP 503 for the configured gemini-3.5-flash-lite model, a gemini-3.1-flash-lite alternate, and a minimal gemini-flash-latest request. The minimal request reported high demand, which isolates the failure from the application's prompt and structured-output schema.

Real generation therefore remains unverified during this provider outage. The application still restricted the synthetic suspicious request, issued no grant, denied the vault and removed the AI term during fallback. See backend/evaluation/aegis-live-api-check.json and aegis-live-api-alternate.json for actual failed-provider reports; passed=false is intentional and must not be presented as a successful live generation test.

The new key is stored in the ignored local environment file and an encrypted repository Actions secret named GEMINI_API_KEY. The manually triggered Live Gemini API check workflow uses that secret, performs one real request and uploads its result. It is not triggered automatically on pull requests and never prints the key. Repository secrets do not automatically configure a separately hosted backend; supply GEMINI_API_KEY through that host's private environment settings.

The local replay configuration remains GEMINI_MODE=mock for a reliable offline demo. To use real Gemini in the running app once the provider recovers, set GEMINI_MODE=auto in backend/.env and restart the backend. No private key is committed in source.
