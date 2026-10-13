# AEGIS Monad submission and user guide

This guide takes the project owner from the supplied source to a working local demonstration, a funded Monad Testnet registry, and a reviewable hackathon submission. The application is implemented and locally verified. Hosting, wallet funding, public-chain deployment and final submission must be completed with the owner's accounts.

## 1 Prepare the project

Open the `AEGIS-final` folder in VS Code. The public source ZIP is safe to use as the basis of a repository. The private configured ZIP contains credentials; keep it private. Use Python 3.14, Node.js 22 and Foundry 1.8 or later. The root README contains the full environment and API reference.

In the first VS Code terminal, from the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python scripts/setup.py --mode demo
cd backend
python -m uvicorn main:app --reload --port 8000
```

On Windows, activate with `.venv\Scripts\Activate.ps1`. In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. Use localhost consistently. The backend API documentation is at http://localhost:8000/docs in development. Setup creates private environment files without overwriting existing values. Copy the admin key value from backend/.env to sign in at /employee. Never include that value in a video, README or public form.

## 2 Use the customer application

Select Simulated replay and scenario A, request access, then open the protected vault. The sample records come from an API route that checks an expiring token and the current case state. They are not public blockchain data and are not actual research datasets.

To demonstrate wallet ownership, connect an Ethereum-compatible browser wallet before the request. Approve the switch to Monad Testnet and sign the access message. This is a message signature, not a token transfer. The backend checks the wallet, purpose, expiry and one-time nonce.

Scenario B shows a mild deviation and may allow or challenge depending on history. If challenged, sign the fresh verification message using the same wallet. A replay begun without a connected wallet uses a fixture address; connect first and rerun it to complete signing.

Scenario C combines a burst, new contracts, failed access and an outlier. Scenario D includes flagged counterparties. Both demonstrate a hold for review or restriction. The customer receives a support code and a clear next step; detailed investigation evidence is in the employee console.

## 3 Review cases and demonstrate memory

Open Employee console and sign in with a configured employee or admin key. Select a case to inspect risk contributions, baseline deltas, supporting and benign interpretations, policy reasons, transaction history and audit events. Record a note explaining the chosen disposition.

For replay C, choose SIMULATED_ATTACK. This preserves simulated provenance, inserts a reviewed signature and revokes existing grants for that wallet. Run E with its separate replay wallet to show similarity to the reviewed pattern. To make a fair comparison, record E before and after confirming C in an otherwise clean demo run.

For identity recovery, create a separate C request with your own connected wallet and leave it unconfirmed. Choose CUSTOMER_VERIFIED in the console. Return to the original customer tab, refresh the review, sign to restore access and open the vault. BENIGN closes a review but does not itself issue access. A confirmed incident revokes grants and cannot be bypassed with this recovery action.

Run F to demonstrate the Gemini outage path. Its decision uses deterministic components after the AI term is removed and weights are renormalized. The case displays the fallback status. Admin Demo controls can reset the dedicated demo database; reset does not reverse blockchain transactions.

## 4 Enable live inputs

Keep a separate database and registry for live operation. Edit backend/.env to set DATA_SOURCE=auto, GEMINI_MODE=auto, REQUIRE_WALLET_SIGNATURE=true and ENABLE_DEMO=false. Provide your server-side Gemini key. Select APP_ENV=production only after configuring all required keys and host settings. Restart the backend.

The supplied detector is trained on 1,000 synthetic normal-wallet rows. It is a proof of concept, not an audited fraud model. Gemini provides bounded interpretation rather than ground-truth labels. The prior 25-packet live-provider evaluation accepted all responses and matched 19 fixture categories. Current browser checks use deterministic mock triage.

RPC scans are bounded and may lack a full baseline. Configure an indexed data source if broader history is needed; partial data must not be presented as a complete wallet history. Do not describe simulated evidence as live mainnet evidence.

## 5 Deploy the registry on Monad Testnet

Monad's official Foundry guide specifies Foundry 1.8 or later and testnet chain ID 10143. The configured public RPC is https://testnet-rpc.monad.xyz. A read-only check during delivery returned 0x279f, which is 10143. Obtain test MON through the official faucet at https://faucet.monad.xyz. See the official deployment instructions at https://docs.monad.xyz/guides/deploy-smart-contract/foundry and network information at https://docs.monad.xyz/developer-essentials/testnet.

Use separate deployer and oracle wallets where practical. Import the deployer into an encrypted Foundry keystore rather than placing a private key in a command. Keep the oracle's key in the backend secret configuration and fund its address with test MON for updates. Do not use a wallet holding real assets for this proof of concept.

From the repository root:

```bash
cd contracts
forge test
cast wallet import aegis-deployer --interactive
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz
export ORACLE_ADDRESS=0xYOUR_ORACLE_ADDRESS
cast chain-id --rpc-url "$MONAD_RPC_URL"
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$MONAD_RPC_URL" --network monad \
  --account aegis-deployer --broadcast
```

Replace the oracle address before executing. The deploy script permits testnet 10143 or local 31337 and assigns the configured oracle. Save the contract address and deployment transaction hash from the output. The owner is the deployer. The owner can rotate the oracle; ownership transfer requires acceptance by the new owner.

Set AEGIS_REGISTRY_ADDRESS to the deployed address, ORACLE_PRIVATE_KEY to that oracle's private key, MONAD_CHAIN_ID=10143, and MONAD_RPC_URL to the same testnet endpoint in backend/.env. Restart the backend. Run an evaluation, open its employee case, and refresh the transaction receipt. Require confirmed status and a successful explorer receipt before citing it as on-chain proof.

The record contains score, expiry, decision and evidence hash. Decision codes are 0 ALLOW, 1 CHALLENGE, 2 REVIEW and 3 RESTRICT. An unknown or expired wallet is denied by isAllowed. Example read check:

```bash
cast call 0xYOUR_REGISTRY_ADDRESS \
  'isAllowed(address)(bool)' 0xYOUR_EVALUATED_WALLET \
  --rpc-url "$MONAD_RPC_URL"
```

Verify source through the explorer's contract verification flow using the exact contract and compiler settings: Solidity 0.8.28, Cancun EVM, optimizer enabled, 200 runs, constructor argument equal to the oracle address. Use the current verification guide linked from Monad's deployment page if the explorer changes its process. Retain the verified source link, deployment hash and at least one confirmed evaluation hash for the submission.

The registry is an asynchronous evidence mirror. The API enforces current case state independently. A review or signature recovery does not automatically replace the prior on-chain score; a new evaluation writes a new record. Do not present the registry as a production revocation system. Local transaction hashes in docs/local-chain-validation.json are local test evidence only and must not be submitted as Monad transactions.

## 6 Host a judge accessible demonstration

Build the frontend and run a persistent backend with one worker and one replica. The repository contains Dockerfiles and compose.yaml for a local two-service deployment. Docker execution was not available during delivery, so test the container build on your host before publishing. The compose defaults expose localhost only.

On the hosting platform, configure AEGIS_API_URL with the backend's private URL, APP_ORIGIN with the public HTTPS frontend origin, COOKIE_SECURE=true and a strong SESSION_SECRET. Backend provider, token, employee and oracle keys are private environment variables. NEXT_PUBLIC_MONAD_CHAIN_ID=10143 is a build-time frontend setting. Attach durable storage for SQLite and keep it out of the public web root.

For a public replay demo, isolate its data and contract from any live instance. Provide judge access through the portal's private instructions if supported; never expose the admin key in source. A least-privilege employee key can inspect and review cases but cannot perform admin reset. Test the hosted customer page, employee login, wallet signature and protected vault from a fresh browser session.

Before recording, reset only the dedicated demo environment. Verify that the displayed Gemini and data-source labels match the mode you intend to claim. Check that explorer links refer to the testnet contract and confirmed transactions, not local Anvil.

## 7 Prepare the submission materials

Prepare a repository link, hosted demo link, concise project description, architecture explanation, short walkthrough video, testnet contract link, confirmed transaction links and instructions for reviewers. These are recommended evidence materials; the signed-in portal determines the actual required fields, file limits and eligibility rules.

Suggested description: AEGIS is a behavior-based authorization prototype for Monad applications. It combines wallet proof, activity features, a trained anomaly detector, deterministic rules, reviewed threat memory and bounded Gemini interpretation. A protected API supports challenges and human review, while a registry records minimal risk evidence on chain.

A useful video sequence is normal access, suspicious activity, employee evidence review, a labeled simulated incident, recurrence, AI outage fallback and a confirmed testnet receipt. Show the customer result and the analyst evidence separately. Do not show environment files, private keys or administrative credentials. Keep the recording within the portal's current duration limit.

Explain the engineering honestly: synthetic training data, optional indexed history, single-process state, a trusted oracle, asynchronous registry updates and mock replay are explicit proof-of-concept limits. Attach the validation record without calling it a security audit or production accuracy benchmark.

## 8 Submit through the official portal

Open https://hackathon.monad.xyz and sign in using the same provider used for registration. The public page lists GitHub, Google and Discord and states that providers create separate accounts. The public date range is 1 September to 13 October. The exact deadline time, timezone, submission fields and rules must be checked in the signed-in portal before relying on that date.

Open the project submission form, enter the team and project details, select only applicable tracks and supply the required links. Use public source from AEGIS-final-source.zip if an archive is requested. Never upload AEGIS-final-private-configured.zip. Test repository, video and demo permissions in a signed-out browser so judges can access them.

Preview the submission and check that the description matches the actual demonstration. Confirm the network, contract address, verified source and successful transaction receipts. Submit before the portal deadline, then save the confirmation page or email and submission ID. Reopen the submission to verify that saved links and files are correct. The project has not been submitted automatically.

## 9 Final checks and recovery

Run the backend suite, frontend lint and production build, and contract tests before the final upload. The delivery passed 228 backend tests and 12 contract tests, including 256 fuzz cases, plus browser and local-chain checks. See VALIDATION.md for what was and was not exercised.

If the frontend reports service offline, check that the backend is running and AEGIS_API_URL is correct. If it rejects an origin, match APP_ORIGIN to the exact browser URL and restart. If a registry write fails, check oracle authorization, funding, chain ID and deployed bytecode. If Gemini falls back, check model access and quota; fallback is designed to preserve deterministic enforcement.

Keep a private backup of environment files and database storage. Never solve a failed Git push by force-pushing over existing history. For a repository that already exists on GitHub, clone it, copy the completed source into the checkout without replacing .git, review the changes, commit and push. Detailed commands are in the README.
