# Deploying the VERITAS frontend

This is a static Vite/React build, deployed for free with GitHub Pages —
no external account needed beyond GitHub itself.

## 1. Enable GitHub Pages for this repository

One-time setup: **Settings → Pages → Build and deployment → Source**,
select **GitHub Actions**. That's it — no branch to create, no
`gh-pages` package.

## 2. Point the build at your deployed API

The frontend calls the backend via `VITE_API_BASE_URL`, baked in at
build time. Set it once the [backend is deployed](../VERITAS/DEPLOYMENT.md):

**Settings → Secrets and variables → Actions → Variables**, add:

- `VITE_API_BASE_URL` — e.g. `https://your-service.onrender.com`

Until this is set, the production build falls back to
`http://localhost:5199`, which only works for local development.

## 3. Push to `main`

The workflow at `.github/workflows/frontend-ci-cd.yml` lints and builds
on every push/PR, and on `main` builds with the GitHub Pages base path
and deploys via `actions/deploy-pages`. The site will be available at
`https://<owner>.github.io/<repo-name>/`.

The app uses a `HashRouter` (URLs look like `.../#/student`) specifically
because GitHub Pages has no server-side rewrite rules — a `BrowserRouter`
deep link would 404 on refresh.

## Local development

```bash
npm install
echo "VITE_API_BASE_URL=http://localhost:5199" > .env.local
npm run dev
```

Run this alongside a locally running instance of the
[VERITAS API](../VERITAS/DEPLOYMENT.md#local-development) with
`Cors__AllowedOrigins__0=http://localhost:5173` set on the backend, or
requests will be blocked by the browser's CORS policy.

## Known limitations

- Backend CORS must explicitly list this site's deployed URL
  (`Cors__AllowedOrigins__0` on the API) — see the backend's
  `DEPLOYMENT.md`.
- Initial login passwords for Students/Faculty default to their
  USN/employee code (set by whoever creates the account from the HOD
  dashboard); there is no self-service password change flow yet.
