# AEGIS frontend

The customer and employee interfaces use Next.js App Router. From this directory run `npm ci`, then `npm run dev`. Run the root `python scripts/setup.py --mode demo` first and start the backend in a separate terminal. Open <http://localhost:3000>.

Use `npm run lint` and `npm run build` to validate changes. The Dockerfile runs the generated standalone server and includes static assets. The browser talks only to the same-origin proxy. Employee credentials are sealed in an HTTP-only session cookie; provider and oracle keys belong only on the backend.

See the root [README](../README.md) for the full walkthrough, environment variables, security boundaries and deployment instructions.
