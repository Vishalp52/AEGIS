# AEGIS submission copy

Prepared October 13, 2026. Video links are supplied separately by the team. Saving portal progress is not final submission.

## Envio

AEGIS uses Envio HyperSync as the indexed activity source for behavioral authorization on Monad Testnet (chain 10143). When a user requests access to a protected research API, the backend retrieves their incoming and outgoing transactions across a timestamp-bounded 24-hour window, plus first activity. It paginates results, removes duplicate self-transfers and requests compact function selectors instead of full calldata. These records directly produce features such as recent transaction counts, contract diversity, new-contract ratio and wallet age. The features feed deterministic rules and a trained Isolation Forest before AEGIS decides whether to allow access, request further verification or route a case to an analyst.

This is a functional data dependency, not a package-only integration. The adapter is backend/app/chain/envio.py, orchestration is backend/app/chain/source.py, and feature extraction is backend/app/features/. The employee investigation interface exposes the resulting evidence and source provenance. With Alchemy configured, AEGIS also corroborates the indexed head's block hash before accepting Envio history. Stale indexes, unavailable providers and histories exceeding the 20-page retrieval bound fall back to an explicitly incomplete RPC scan rather than being represented as complete history.

An October 13, 2026 live provider check for public wallet 0x4edf4af8fbd55409ddeb326b91248896554fce0f returned three transactions in a complete window. The combined pipeline reported source envio, normal history confidence, derived features and successful Alchemy chain/block-hash corroboration. Credentials are configured privately in the deployed backend. This check was run locally against live providers; the hosted wallet-signing demonstration remains to be recorded. Simulated replay is separately labeled and bypasses live providers.

Product: https://aegis-web-8nd8.onrender.com/
Source and reproduction instructions: https://github.com/Vishalp52/AEGIS/blob/main/docs/SPONSOR_INTEGRATIONS.md

## Alchemy

AEGIS integrates Alchemy's Monad Testnet JSON-RPC endpoint into its authorization evidence pipeline. Alchemy is the configured RPC transport, selected ahead of the generic public RPC. Before accepting Envio-indexed history, the backend checks eth_chainId against 10143, fetches the indexed head block through Alchemy and compares its canonical hash with the Envio block hash. It also retrieves the wallet transaction count/nonce. These checks establish that the activity used by the risk engine corresponds to the expected chain and block.

If indexed data is unavailable, stale, incomplete or fails corroboration, the backend uses a bounded Alchemy block scan. The result is explicitly marked as partial history so limited evidence is not presented as a complete account history. This affects the behavioral features and evidence confidence used in an access decision. Provider errors are logged without exposing credential-bearing URLs.

The live October 13, 2026 check confirmed chain 10143, retrieved current blocks, corroborated the indexed block hash and wallet nonce 2, and passed the combined Envio/Alchemy pipeline for public wallet 0x4edf4af8fbd55409ddeb326b91248896554fce0f. All 237 backend tests passed, including wrong-chain, mismatched-hash and unavailable-provider cases. The deployed backend has the private Alchemy endpoint configured. The local live-provider check is distinct from the hosted wallet-signing demonstration, which remains to be recorded.

Code: backend/app/chain/monad_rpc.py and backend/app/chain/source.py. The optional registry writer also supports this RPC transport, but no public registry deployment or on-chain write is claimed.

Product: https://aegis-web-8nd8.onrender.com/
Repository: https://github.com/Vishalp52/AEGIS
Verification guide: https://github.com/Vishalp52/AEGIS/blob/main/docs/SPONSOR_INTEGRATIONS.md

## Dynamic

AEGIS uses the Dynamic React SDK for wallet onboarding, wallet selection and message signing on its deployed customer interface. DynamicContextProvider and EthereumWalletConnectors initialize the AEGIS Sandbox environment; DynamicWidget displays the live login flow. Monad Testnet (10143) is enabled and the hosted AEGIS origin is configured. The deployed login has been checked in the browser and offers email, MetaMask, Coinbase and WalletConnect.

The integration is connected to the actual authorization flow. The selected Dynamic wallet signs a fresh backend-issued nonce for an access request, and signs subsequent challenge or recovery messages when required. AEGIS independently verifies EIP-191 wallet signatures on the backend before issuing scoped, expiring vault access. Dynamic login by itself does not grant access to the protected API.

The signing adapter validates the selected account and network before and after the signing request. Account changes, network changes and logout clear the vault interface and invalidate the in-flight session generation. Tests cover signing cancellation and account/network changes. The current backend supports standard EOA signatures, not EIP-1271 contract-wallet signatures.

Implementation: frontend/components/dynamic-home.tsx, frontend/components/wallet-entry.tsx and frontend/lib/dynamic-signing.ts. The environment ID is public runtime configuration; no Dynamic server API key is required. The deployed login UI has been verified, while a complete user-controlled wallet signing and vault-access session remains pending and should be shown in the final demo. We do not claim an end-to-end wallet test has already passed.

Product: https://aegis-web-8nd8.onrender.com/
Repository: https://github.com/Vishalp52/AEGIS
Verification guide: https://github.com/Vishalp52/AEGIS/blob/main/docs/SPONSOR_INTEGRATIONS.md

## Description

AEGIS is an enterprise-oriented access-security product being developed for organizations building wallet-enabled applications on Monad. It addresses a gap in wallet authentication: a valid signature proves control of a wallet, but does not establish that the activity behind a request is legitimate. If a wallet is compromised, ownership checks alone may still allow access to sensitive application resources. Security teams need additional evidence, understandable decisions and a practical way to investigate unusual activity without permanently excluding legitimate users.

AEGIS combines wallet ownership verification with behavioral assessment. Dynamic provides wallet onboarding and message signing. Envio HyperSync retrieves recent Monad Testnet activity, while Alchemy corroborates the chain and indexed block hash and provides bounded RPC fallback. AEGIS turns that activity and application access history into structured features, evaluates them using deterministic rules and an Isolation Forest, and incorporates analyst-reviewed threat memory. The Gemini integration is designed to interpret structured evidence within strict limits; the hosted demonstration currently uses mock Gemini responses. Deterministic policy controls the final decision.

The product applies this process to a protected research API. Users can be allowed access, asked for an additional signature, routed to human review or restricted. Scoped, expiring access tokens protect the resource, and revocation checks apply to subsequent calls. An employee console presents the evidence, risk contributions, decision trace and investigation history, with a reviewed recovery path for legitimate users. Public blockchain data remains public; AEGIS controls access to the application's private resource.

AEGIS is useful because it connects detection to an operational response. Developers get an authorization workflow they can integrate into a wallet-enabled application, while security and operations teams get persistent cases and explanations they can investigate. Our ambition is broad enterprise adoption across protected APIs, customer portals and sensitive wallet-enabled workflows. We plan to pursue that adoption through focused pilots, measurable outcomes and repeatable integrations; we are not claiming existing enterprise customers or widespread deployment.

The current release is a publicly hosted proof of concept with customer and employee interfaces, a protected backend, persistent case storage, a synthetic-data-trained detector and an implemented Solidity evidence registry. Envio and Alchemy passed a combined live Monad Testnet provider check, and Dynamic's deployed login has been verified. A complete user-controlled wallet signing session remains to be demonstrated. The registry has local contract validation but no claimed public Monad deployment. Broader evaluation, security review, privacy controls and production hardening are required before enterprise rollout.

## Gtm

AEGIS will enter the market through a focused enterprise use case: behavioral authorization for applications that already use wallet signatures to protect sensitive resources. Our first prospective users are Monad application developers and the security or operations teams responsible for private APIs, research portals and privileged customer workflows. Rather than pursue every security use case at once, we will test whether AEGIS helps these teams identify unusual access, investigate it efficiently and restore legitimate users with less disruption.

Our initial acquisition strategy is founder-led outreach within the Monad ecosystem, supported by the public repository, a working demo, technical documentation and integration examples. We will seek design partners through developer communities, hackathon follow-up and direct conversations with application teams. Envio, Alchemy and Dynamic are technology integrations in the product; any future co-marketing or referral relationship would require separate agreement and is not an existing partnership claim.

Early pilots will begin in observation mode, allowing a partner to compare behavioral assessments with its current access controls before enabling enforcement. We plan to agree on success criteria in advance: integration effort, evidence coverage, decision latency, false-positive and challenge rates, analyst review time, and successful recovery for legitimate users. We will use feedback and permissioned, representative evaluation data to improve policies and assess the model beyond its current synthetic training set. We will not promise reduced fraud or account takeover rates before measuring those outcomes.

Successful pilots would lead to a repeatable onboarding package: documented APIs, reference integrations, configurable policies and a clear investigation workflow. Our proposed commercial model combines a developer evaluation tier with paid plans based on protected applications and assessed request volume, with enterprise support and deployment options where justified. Pricing and service commitments will be validated through customer discovery and operating-cost analysis rather than presented as established offers.

Long-term expansion would come from proven deployments within one team, followed by adoption across additional applications in the same organization and referrals supported by customer-approved case studies. Enterprise readiness will require independent security review, reliable monitoring, data-retention and privacy controls, role-based administration and documented incident response. Our aim is for AEGIS to become widely implemented infrastructure for wallet-enabled enterprise applications, with growth grounded in measurable customer value and dependable operation.

## Judges

Open https://aegis-web-8nd8.onrender.com/. Simulated replay offers labeled example scenarios without a funded wallet; it is not evidence of live chain collection. Production settings require wallet ownership proof before vault access is granted.

For the live flow, choose Live wallet, click Log in or sign up, connect through Dynamic and select Monad Testnet (10143). Request vault access and approve only the displayed authentication message. No payment or token approval is required for the access-signature flow. Complete any additional signature challenge requested by the policy. An ALLOW decision can open the protected research vault; sparse or unusual history may lead to a challenge or review instead.

The employee console requires a private operator key and is not a public login. Do not use repository placeholders as credentials. Source, setup and provider-check instructions are in README.md and docs/SPONSOR_INTEGRATIONS.md. Dynamic is configured in Sandbox. Gemini is mocked on the hosted demonstration, and the optional registry is not publicly deployed. The recorded demo will be added by the team.
