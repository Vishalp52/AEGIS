AEGIS judge walkthrough

Website: https://aegis-web-8nd8.onrender.com/
Employee console: https://aegis-web-8nd8.onrender.com/employee
Code: https://github.com/Vishalp52/AEGIS

1. Start with the customer demo
Open the website and check that it says “Security service online.” Choose Simulated replay. These scenarios use labeled example activity, so they let you inspect the decision process without needing a funded wallet. Choose A (Normal wallet) and click Request vault access. The page shows the decision and next step. An ALLOW result without a verified wallet does not unlock the vault: the hosted backend requires ownership proof before granting access.

Try B for a possible extra verification step, C for account-takeover-style behavior, D for a flagged-activity example, E for a reviewed-pattern example, and F for an AI outage. Results can change with recent attempts and existing reviewed patterns. Scenario F deliberately exercises the fallback. The labels describe synthetic scenarios, not accusations about a real wallet.

2. Test real wallet ownership
Choose Live wallet, then Log in or sign up. Connect an EVM wallet through Dynamic and select Monad Testnet (chain 10143). Safari users can scan the MetaMask/WalletConnect QR using a phone wallet. Request vault access and read the authentication message before signing it. This signature does not transfer tokens or approve spending. Do not enter a private key or recovery phrase into AEGIS.

If access is approved, open the vault. If you receive a challenge, sign the fresh verification message using the same wallet. A new or unusual wallet can be sent for review instead of being allowed; that is an expected policy result. Switch wallets or sign out and confirm that previous vault access disappears. Cancelling a signature should not grant access. The complete Dynamic signing walkthrough is still being verified by the team.

3. Sign in as a judge
Open the employee console in a second tab. Paste the judge key provided in the private submission instructions into Access key and click Sign in. No username is needed. This account can inspect and review cases but cannot use admin-only reset actions. It is a shared test environment, so please use simulated cases for review testing. The customer and employee sessions are separate.

4. Inspect a case
Click Refresh and select the case matching your customer request or support code. Inspect the behavior features, baseline comparisons, risk contributions, reason codes, Gemini status, policy trace and audit history. Replay cases are marked simulated. For real chain evidence, look for source “envio,” normal history confidence and an “Alchemy verified” note. A partial RPC fallback is labeled as incomplete history.

5. Try an employee review
For a simulated suspicious case, add a note explaining your decision. BENIGN closes the review but does not issue a vault token by itself. SIMULATED_ATTACK records a reviewed simulated pattern and revokes existing grants. Do not label a replay as a real confirmed attack. To demonstrate pattern matching, compare scenario E before and after reviewing a separate C example.

For recovery, first create a replay request while your own wallet is connected. On that case choose CUSTOMER_VERIFIED in the employee console. Return to the original customer tab, refresh review status and sign the recovery message with the same wallet. A confirmed or revoked incident cannot be reopened this way. Expired cases need a new request. An active restriction persists until expiry or analyst resolution, even if a later score is lower.

6. What is verified and what is pending
The hosted service has passed real Gemini generation (mode auto, Gemini status ok), employee sign-in and live Envio history retrieval with Alchemy chain/block-hash verification. The section 7 merge passed 292 backend tests and 20 frontend tests; lint, production build and 12 contract tests also passed. The model uses synthetic training data. The registry contract is locally tested but public deployment is still pending. Provider failures use a conservative fallback rather than silently granting access. This is a hackathon proof of concept, not an audited production security product.

If a request takes time, allow it to finish before trying again. A 429 response means the rate limit was reached; wait before retrying. If an employee session expires, sign in again. Keep the judge key out of public videos. The team will supply the demo and pitch links separately.
