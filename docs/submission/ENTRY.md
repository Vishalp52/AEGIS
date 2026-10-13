# AEGIS Monad submission pack

Prepared for the project owner on 13 October 2026. This pack contains entry text, recording scripts and the remaining submission steps. The local application works and GitHub CI passes. The entry is not ready for final submission: a confirmed Monad deployment and hosted demo and pitch videos are still missing. Live Gemini generation remains unavailable in the latest check.

## 1 Entry fields

Primary track: Trust, Identity & AI Infrastructure

Project name: AEGIS

Short description:

Behavior-based access protection for Monad apps, combining wallet signatures, anomaly detection, AI-assisted review, and an on-chain evidence registry.

Logo: upload AEGIS-logo.png from this folder. It is a 1200 by 1200 PNG under 2 MB. The SVG is an editable master, not the portal upload file.

Repository: https://github.com/Vishalp52/AEGIS

The repository is public. Current checked code revision: ec3dd7d369f207c9f8ff9b4c18ccba4749bb9819. Submission materials in this delivery were prepared after that revision.

The pasted form omitted the labels of its two 8,000-character fields. Use the following project overview and implementation text where their subjects match the actual labels. Do not paste an implementation answer into a field asking a different question.

### Project overview

AEGIS is a behavior-based authorization prototype for applications on Monad. Proving control of a wallet does not explain whether its current activity is consistent with its normal use. We built AEGIS to combine that ownership proof with observable behavior and a review process before granting access to a protected research API.

A customer connects an Ethereum-compatible browser wallet and signs a fresh message. AEGIS evaluates activity features using deterministic rules, a trained Isolation Forest, reviewed threat memory and bounded Gemini interpretation. Its policy can allow access, request another signature, hold a case for employee review or restrict access. The customer receives a clear outcome and next step, while an employee console exposes the evidence and reasoning behind the decision.

Reviewers can inspect behavior changes, alternative benign explanations, policy contributions and an audit trail. Confirming a simulated incident creates a reviewed pattern that can be compared with later cases. Identity recovery requires an employee decision followed by a fresh signature from the original wallet. A confirmed incident revokes existing grants.

The Solidity registry is designed to record minimal risk evidence on Monad: a score, decision, expiry and evidence hash. Detailed investigations stay off chain. This gives the prototype an inspectable record without putting its full case packet into a public transaction.

Our six-person team consists of a Lead Developer who also serves as Director of Business Operations, two backend developers and three frontend developers. We are building a practical way for application operators to investigate unusual wallet behavior while giving legitimate users a defined route back to access.

The current delivery is a locally tested proof of concept. Public Monad deployment and hosting remain pending. Replay scenarios are explicitly simulated, and the supplied anomaly model is trained on synthetic data. We do not claim production fraud accuracy or an audited security system.

### Implementation and Monad integration

AEGIS uses a Next.js customer interface and employee console, a FastAPI backend, SQLite case persistence and a Solidity registry. Browser requests pass through a same-origin server proxy. Private provider and signing credentials remain on the server.

Wallet ownership uses EIP-191 signatures with a one-time nonce, a purpose and an expiry. The frontend verifies the selected account and chain around signing and discards pending access results when the wallet changes. Protected API calls require a scoped, expiring token and a current case state that permits access.

The behavior pipeline extracts eight features, compares activity against a baseline and combines deterministic rules with an Isolation Forest trained on 1,000 synthetic normal-wallet rows. Reviewed incidents supply similarity evidence with explicit simulated or live provenance. Gemini receives a filtered evidence packet and returns a validated interpretation. Its contribution is bounded; provider failure removes the AI term and uses the remaining policy components. AEGIS does not fine-tune Gemini.

The activity adapters support a bounded Monad RPC scan and an optional indexed data source. Partial history is labeled rather than treated as a complete wallet history. Deterministic replay scenarios exercise normal access, unusual activity, review, recurring patterns and AI outage handling.

An authorized oracle can publish the risk decision, expiry and evidence hash to AegisRegistry on Monad Testnet, chain ID 10143. The registry rejects unauthorized writes and treats unknown or expired records as not allowed. The backend checks the network and can look up transaction receipts. The intended integration is implemented, but the current evidence contains local Anvil transactions only; no confirmed public testnet deployment is claimed yet.

The registry is an asynchronous evidence mirror. API access is enforced against current backend state. A review or recovery does not automatically replace an older chain record; a fresh evaluation publishes a new one. The prototype also requires one backend worker and replica because nonce and rate-limit state are process-local.

Validation includes 231 backend tests, 11 frontend wallet and API tests, frontend lint and production build, and 12 contract tests including fuzz testing. GitHub CI for the checked revision completed successfully. Browser tests exercised signatures, review recovery, protected access and stale-response handling with an injected test wallet. This is not certification of every wallet extension. The latest real Gemini request returned HTTP 504; deterministic fallback restricted the suspicious request and denied vault access.

## 2 Private judging instructions

Use the following text in the private judging field after adding the real hosted URL and judge access details. Replace all bracketed placeholders before submission. Do not include an admin key, Gemini key or oracle private key.

Demo URL: [ADD PUBLIC HTTPS APP URL]
Employee console: [ADD PUBLIC HTTPS APP URL]/employee
Judge employee access key: [ADD A DEDICATED EMPLOYEE KEY IN THIS PRIVATE FIELD ONLY]
Network: Monad Testnet, chain ID 10143
Registry address: [ADD DEPLOYED CONTRACT ADDRESS]
Contract explorer URL: [ADD VERIFIED CONTRACT URL]
Deployment transaction: [ADD CONFIRMED TESTNET TRANSACTION URL]
Evaluation transaction: [ADD CONFIRMED TESTNET TRANSACTION URL]

Open the customer page in a browser with an Ethereum-compatible wallet extension. Connect the wallet, approve Monad Testnet and select Simulated replay. This mode uses synthetic activity even when the wallet signature is real. Start with A Normal wallet, request access and open the protected vault. Its records are sample API content.

Run C Account-takeover style to see a held request. Open the employee console and inspect its evidence, policy reasons and audit events. For incident memory, record SIMULATED_ATTACK and then run E Pattern recurrence; compare E before and after confirming C in a clean demo database. For identity recovery, use a separate unconfirmed C case created with a connected wallet, record CUSTOMER_VERIFIED, then return to the original customer tab, refresh review status and sign the new recovery message. An incident already confirmed and revoked cannot use that recovery path.

Run F Gemini unavailable to inspect deterministic fallback. The supplied local setup uses mock Gemini for repeatable replay. Live generation was unavailable in the 13 October check; provider status must be disclosed in the recorded demo. Contract receipt links should be used only after deployment and confirmed testnet writes. The application is a prototype, and the registry does not automatically mirror every review-state change.

## 3 Demo video plan

Record the working application, not slides or source code. Aim for 2 minutes 45 seconds, leaving 15 seconds under the portal limit. Finish the public testnet setup before recording the qualifying version. Keep wallet approvals and employee sign-in prepared, with credentials hidden. Rehearse once because wallet dialogs and transaction confirmation can take time. Keep labels showing simulated data and AI mode visible.

0:00 to 0:15 — Show the customer app. Say: “AEGIS adds behavior checks to wallet-based access. This demonstration uses labeled simulated activity and real wallet ownership signatures.”

0:15 to 0:45 — Connect the wallet on Monad Testnet. Run A, approve its signature and open the vault. Say: “This request passes policy. The protected API checks an expiring grant before returning these sample records.”

0:45 to 1:15 — Run C and show the hold. Open its employee case. Say: “A burst of unusual behavior changes the decision. The customer gets a next step, while an analyst can inspect the evidence and policy contributions.”

1:15 to 1:50 — On this unconfirmed case, select CUSTOMER_VERIFIED and save a note. Return to the customer, refresh review and sign recovery. Open the vault. Say: “Review alone does not issue access. The same wallet must sign a fresh recovery proof.”

1:50 to 2:15 — Run F and show its fallback evidence. Say: “When the AI service is unavailable, the policy removes its contribution and still makes a decision. This view makes the fallback explicit.”

2:15 to 2:40 — Show a real confirmed evaluation receipt and its testnet explorer page after deployment. Say only once verified: “This confirmed Monad Testnet transaction records a decision, expiry and evidence hash. Detailed case evidence stays off chain.” Do not substitute the local Anvil report or an unconfirmed transaction.

2:40 to 2:45 — Return to the app. Say: “AEGIS combines wallet proof, behavior checks and accountable review.”

Upload the recording to YouTube, Loom, Vimeo or another host. Confirm it plays while signed out and stays below three minutes. Paste the video URL, not the app URL, into the demo video field. Public promotion permission is your choice; judges see the demo either way.

## 4 Pitch video script

Target duration: approximately 90 seconds at a conversational pace. The presenter is the Lead Developer and Director of Business Operations. Add names verbally only if the team wants them included. Record an introduction, not a second code walkthrough.

“Hi, I’m the Lead Developer and Director of Business Operations for AEGIS. Our team includes two backend developers and three frontend developers.

A wallet signature proves control of an address. For an application operator, that still leaves a practical question: does this request look consistent with the way that wallet normally behaves?

We built AEGIS to help answer that question before a protected API grants access. It combines wallet signatures, activity features, anomaly detection and human review. Gemini can contribute an interpretation, but its influence is bounded and the policy continues working when the service is unavailable.

Customers receive an understandable outcome and a recovery step. Reviewers can inspect the evidence, record a decision and require a fresh wallet signature before restoring access. Reviewed patterns can also inform later investigations.

Our Monad integration is designed to publish minimal risk evidence to a registry, keeping detailed case records off chain. We are building this because useful access controls need both a clear enforcement path and a way for legitimate users to recover.

Today AEGIS is a tested prototype using synthetic training data and labeled replay scenarios. Our next milestone is a deployed Monad demonstration, followed by broader evaluation against realistic activity. We want application teams to be able to inspect why access changed and act on that evidence.”

After a successful public deployment, replace the next-milestone sentence with: “We demonstrate the registry on Monad Testnet, and our next step is broader evaluation against realistic activity.” Make that change only after verifying deployment and a successful evaluation receipt.

Upload a video under two minutes and confirm signed-out playback. The pitch link is separate from the demo link. Choose the public promotion permission independently.

## 5 Optional promotion

Optional 30-second clip script, approximately 20 to 25 seconds:

“A wallet signature is only the beginning. AEGIS checks behavior before granting access, explains suspicious requests to reviewers and gives legitimate users a recovery path. Built for Monad applications, our prototype brings wallet proof, anomaly detection and an evidence registry into one workflow. Watch AEGIS turn a risky request into a reviewable decision.”

Use short shots of normal access, a held request and its case evidence. Keep the clip under 30 seconds. Add an X handle only if it belongs to the team or project; no handle has been supplied.

Bounties are optional. Submit in the selected primary track alone unless the team has actually integrated a sponsor and checked that bounty’s separate requirements. This review does not establish eligibility for any sponsor bounty.

## 6 Readiness and submission steps

PASS — Project name and short description fit the supplied character limits. Both long answers and private instructions fit 8,000 characters each.

PASS — A 1200 by 1200 PNG logo is provided below the 2 MB limit.

PASS — Repository is public and accessible without signing in. GitHub CI for ec3dd7d completed successfully on the readiness check.

PASS — Local frontend and health endpoint returned HTTP 200 on 13 October. Existing browser checks cover wallet and review flows; the current local configuration uses mock Gemini.

NOT YET MET — The supplied form requires the product to run on Monad Mainnet or Testnet. No registry or oracle is configured in the delivered local environment. Local Anvil tests and switching a wallet to Testnet do not establish this requirement.

PENDING — A judge-accessible hosted application URL has not been provided or verified. This is the recommended way to let judges try the product; the pasted form explicitly requires hosted video links.

PENDING — Demo and pitch videos must be recorded, uploaded and linked. The scripts are prepared; no video has been recorded or uploaded by this delivery.

LIMITED — Live Gemini generation returned HTTP 504 in the latest check. Fallback passed its checks. Do not describe mock triage or historical provider checks as current successful live AI generation.

UNVERIFIED — The pasted form does not include full eligibility, team-size, prior-work, IP, deadline-time or bounty rules. Confirm those in the signed-in portal. Six team members have been documented, but team-size eligibility has not been established.

First, follow docs/MONAD_GUIDE.md sections 5 and 6 to fund the deployment and oracle wallets, deploy the registry, configure the backend and host the app. Save the real contract address and successful transaction links. Run a fresh evaluation and confirm its receipt on Testnet. Verify wallet signatures and protected access from a fresh browser session on the hosted app.

Second, verify provider status and disclose whichever mode is used. Record the product demo and team pitch, upload them and check playback while signed out. Replace every bracketed placeholder in the private instructions. Use a dedicated employee key for judges, supplied only through the private field.

Third, upload the PNG, paste the entry text and links, choose promotion permissions and add only qualifying bounties. Select Save progress, reopen the entry and verify the saved information. Saving is not submitting. Select Submit when all required fields and evidence are ready, then retain the confirmation and submission ID.

The official public event page lists 1 September to 13 October. It does not establish the exact cutoff time or timezone; check that inside the portal immediately. This preparation did not save or submit an entry.

## 7 Evidence and references

Official event and login: https://hackathon.monad.xyz/
Official Monad deployment instructions: https://docs.monad.xyz/guides/deploy-smart-contract/foundry
Public source: https://github.com/Vishalp52/AEGIS
GitHub checks: https://github.com/Vishalp52/AEGIS/actions

The checklist uses the form supplied by the project owner and official public pages checked on 13 October 2026. The selected track is a reasonable fit for authorization, wallet ownership and AI-assisted infrastructure; this is a project assessment, not an organizer eligibility decision.

Local evidence: docs/API_WALLET_CHECK.md, VALIDATION.md, docs/local-chain-validation.json and backend/evaluation/submission-live-api-check.json. The latest live check reports passed=false because Gemini did not return an accepted response. All other checks in that isolated report passed, including holding the suspicious request, denying the vault and removing the AI term during outage.

The public source archive contains this pack, application source, tests, trained model, deployment files and the detailed README. It excludes private environment files. The private configured archive contains credentials and is not an upload for the submission portal or a public repository.
