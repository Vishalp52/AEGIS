# AEGIS submission

Our project description, go-to-market plan and sponsor answers. Video links are added separately.

## Envio

We use Envio HyperSync to bring real Monad wallet activity into AEGIS. When someone requests access, we look at their recent transactions and turn that activity into signals such as how often they transact, which contracts they interact with and how new their wallet is. Those signals feed our risk checks and help decide whether to allow access, ask for more verification or send the request for review.

Envio is part of the decision process, and the employee console shows the evidence behind each case. We handle duplicate transactions and incomplete history, and use Alchemy to check that the indexed block matches the chain. If we cannot get complete data, we label the fallback instead of treating it as a full history.

The combined Envio and Alchemy check passed using live Monad Testnet data. The integration is configured on our deployed backend. Our replay examples are labeled as simulated and are separate from the live wallet flow.

## Alchemy

We use Alchemy to connect AEGIS to Monad Testnet and check the blockchain data behind an access decision. Before using the wallet history returned by Envio, we check the chain ID, compare the indexed block hash with the block returned by Alchemy and read the wallet transaction count.

Alchemy also provides our fallback when indexed history is unavailable. We scan a limited range of blocks and mark that result as partial, so the security engine does not mistake missing data for normal behavior. This gives AEGIS a second source for checking the evidence used by its risk model.

The combined live data check passed, and the Alchemy endpoint is configured privately on our hosted backend. The optional contract writer can use the same connection, but our registry has not yet been deployed publicly.

## Dynamic

We use Dynamic for wallet connection and signing in AEGIS. Users can open the login flow on our website and connect a wallet for Monad Testnet. The deployed login supports email, MetaMask, Coinbase and WalletConnect.

The selected wallet is used to sign the access message from our backend. If a request needs another verification step or an employee approves recovery, the same wallet signs that message too. Our backend checks the signature before granting access. Logging in through Dynamic alone does not unlock the protected resource.

We also clear access when the user changes wallets, changes networks or signs out. The integration is deployed in Dynamic Sandbox and the login interface has been checked. We still need to finish the full wallet-signing walkthrough for the demo.

## Description

We are building AEGIS as an enterprise security product for applications that use wallets to control access. A wallet signature proves that someone controls a wallet, but it does not tell a business whether the request is safe. If a wallet is compromised, the person using it can still produce a valid signature. We want to give companies another layer of protection before they let that request reach a sensitive resource.

AEGIS checks wallet ownership alongside activity and access behavior. Dynamic handles wallet connection and signing. Envio brings in recent Monad activity, and Alchemy checks that the indexed data matches the expected chain and block. We turn that information into behavioral signals and combine it with rules, an anomaly model and patterns reviewed by an analyst. The result can allow access, ask for another verification step, send the case for review or restrict it.

We built a customer interface and an employee console around that process. Customers get a clear result and a way to recover access. Employees can see what triggered a decision, review the evidence and record an outcome. Access to the research vault is controlled by expiring tokens and the current case status, so a revoked request cannot keep using an old grant.

Our goal is to make AEGIS something companies can integrate into their existing applications and use across protected APIs, customer portals and sensitive workflows. We want it to be widely implemented because it gives developers an access-control flow and gives security teams a practical way to investigate unusual activity. We plan to start with focused pilots and expand after we can show useful results.

The current version is a hosted proof of concept on Monad Testnet. Envio and Alchemy passed a combined live data check, and Dynamic wallet signing and protected vault access passed a live Safari/MetaMask walkthrough. Our anomaly model uses synthetic training data, hosted Gemini generation has passed a live check, and the Solidity registry is implemented and tested locally but not publicly deployed. Security review and broader testing are part of the work needed before enterprise rollout.

## Gtm

We plan to start with teams building wallet-enabled applications on Monad, especially teams protecting private APIs, customer portals and sensitive user actions. These are the users who already rely on wallet signatures and can benefit from checking behavior before granting access.

Our first step is direct outreach through the Monad developer community, hackathon connections and conversations with application teams. We will use the working demo, public code and clear integration guides to show what AEGIS does. We want a small group of design partners who can test it against a real access-security problem and tell us where it helps and where it adds friction.

We would start pilots in observation mode so a team can compare AEGIS decisions with its current process before enabling restrictions. We would measure setup time, decision speed, unnecessary challenges, review time and how easily legitimate users recover access. That feedback will guide the product and help us evaluate the model beyond synthetic data.

After successful pilots, we plan to offer a repeatable integration process, configurable policies and a paid service based on protected applications and request volume. We would also offer enterprise support where needed. Pricing will come from customer feedback and operating costs rather than assumptions made during the hackathon.

We want to grow from one useful deployment into more applications within the same company, then use customer-approved examples and referrals to reach other teams. Our long-term goal is broad enterprise adoption. To get there, we need reliable performance, strong privacy controls, independent security review and evidence that the product helps customers.

## Judges

Open https://aegis-web-8nd8.onrender.com/ to try the customer flow. Simulated replay has labeled examples of normal and unusual activity. For the live flow, choose Live wallet, connect through Dynamic and use Monad Testnet. Request access and sign the authentication message. No token transfer or payment is needed for the signature flow.

The employee console is at https://aegis-web-8nd8.onrender.com/employee. Use the separate judge key provided in this private field to view cases and test reviews. This is a shared demonstration, so review actions affect the demo cases. Please use simulated cases for review testing.

Dynamic is in Sandbox, hosted Gemini generation has passed a live check and the optional registry is not publicly deployed. Setup and test instructions are in our GitHub README.
