# AEGIS backend

See the root [README](../README.md) for setup, configuration, API routes, model calibration and limits. Start from this directory with `python -m uvicorn main:app --reload --port 8000` after installing the root requirements and running `python scripts/setup.py` from the repository root.

The development OpenAPI UI at <http://localhost:8000/docs> is generated from the actual request and response schemas. Use one backend worker. Cases, reviews, attempts and reviewed incidents persist in SQLite; nonce and rate-limit state remain process-local. The registry is optional and asynchronous.

The [Monad guide](../docs/MONAD_GUIDE.md) covers contract deployment and submission. The [validation record](../VALIDATION.md) distinguishes executed tests from operator deployment steps.
