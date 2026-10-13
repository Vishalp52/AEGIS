# Publish AEGIS on Render

The root render.yaml configures a public Next.js web service, a private Python API, and a 1 GB persistent disk for case storage. Both services use the Starter plan and one instance. Review Render's displayed charges before approving deployment; persistent disks require paid hosting. This configuration has not yet been deployed or container-tested locally because Docker is unavailable here.

1. Open https://dashboard.render.com/select-repo?type=blueprint and create a Render account using GitHub.
2. Connect https://github.com/Vishalp52/AEGIS and select its main branch. Use render.yaml from the repository root.
3. Review the two services and disk, then approve the plan and deploy. Do not enter payment details into chat.
4. Wait for aegis-api and aegis-web to become healthy. Open the HTTPS address Render assigns to aegis-web. This is the public website URL; the backend remains private.
5. In aegis-api's Environment panel, copy the generated AEGIS_ADMIN_KEY privately to sign into /employee. For judges, add a separate AEGIS_EMPLOYEE_KEYS entry in name:key format and share that key only in the private judging instructions.
6. Connect a browser wallet on Monad Testnet, run a replay, approve its signature, and check protected vault access. Test employee sign-in and case review. Check /api/aegis/health on the public origin.

The web service receives the backend address through Render's private service reference. The frontend checks browser origins against RENDER_EXTERNAL_URL unless APP_ORIGIN explicitly overrides it. Set APP_ORIGIN to the exact HTTPS origin if adding a custom domain. Secure employee cookies and generated session/token secrets are configured automatically. Keep one instance and one backend worker because nonces and rate limits are process-local.

This is a public demonstration with labeled mock AI. It does not claim live Gemini generation or an on-chain deployment. To enable Gemini, add GEMINI_API_KEY through the backend's private Environment panel, set GEMINI_MODE=auto, redeploy and verify an accepted live response. The latest provider test failed with HTTP 504. A GitHub Actions secret does not automatically become a Render environment variable.

For Monad evidence, follow MONAD_GUIDE.md section 5. Add the real AEGIS_REGISTRY_ADDRESS and authorized ORACLE_PRIVATE_KEY to the backend environment after funding and deployment, then require a confirmed evaluation receipt. Hosting by itself does not satisfy the requirement to run the product on Monad Mainnet or Testnet.

Do not publish environment files or the private configured ZIP. An unavailable provider must remain visibly labeled as fallback. The API health check verifies reachability, not provider success or registry deployment.
