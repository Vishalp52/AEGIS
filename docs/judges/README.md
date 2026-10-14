# Judge access and local setup

## Test the deployed product

Open https://aegis-web-8nd8.onrender.com/ . The hosted backend already has the provider configuration; no API keys or access to the developer's computer are needed.

For employee reviews, open https://aegis-web-8nd8.onrender.com/employee and use the judge key in the Monad submission's private Judge access instructions. No username is required. The walkthrough is in [JUDGE_GUIDE.md](../JUDGE_GUIDE.md).

The API implementation for Gemini, Envio, Alchemy and Dynamic is included in this repository. Live provider credentials are configured privately in hosting and are not required to browse this source or use the hosted demo.

## Optional local reproduction

Create a virtual environment and install requirements-dev.txt. Copy provider-credentials.env.example to backend/.env, then fill in your own provider credentials privately. If backend/.env exists, merge the settings instead of overwriting it. Keep that file ignored.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp docs/judges/provider-credentials.env.example backend/.env
# Fill backend/.env privately before running this check.
python scripts/check_sponsors.py --wallet 0x4edf4af8fbd55409ddeb326b91248896554fce0f
```

The script verifies Envio and Alchemy. Dynamic requires interactive wallet signing, so its script result remains false by design. Public registry deployment remains pending.
