# Feedback Worker

Creates a GitHub issue from the About-page feedback form, so visitors submit
in-app instead of being sent to GitHub. Runs at
`https://beta.billymccomiskey.com/api/feedback`.

## One-time setup

1. **Create a GitHub token** (fine-grained PAT):
   - GitHub → Settings → Developer settings → Fine-grained tokens → Generate
   - Repository access: only `mmccomiskey/billy-mccomiskey`
   - Permissions: **Issues → Read and write**
   - Copy the token (you won't see it again). Do **not** commit it or paste it anywhere public.

2. **Deploy the Worker** and set the token as a secret. From this folder:
   ```bash
   npm i -g wrangler        # if not installed
   wrangler login
   wrangler secret put GITHUB_TOKEN   # paste the PAT when prompted
   wrangler deploy
   ```
   (Or: deploy via the dashboard/API, then add `GITHUB_TOKEN` under the Worker's
   Settings → Variables and Secrets, encrypted.)

3. Test:
   ```bash
   curl -s -X POST https://beta.billymccomiskey.com/api/feedback \
     -H 'content-type: application/json' \
     -d '{"name":"Test","category":"suggestion","message":"hello from curl"}'
   ```
   A `{"ok":true,"url":...}` response means it filed an issue.

## Notes

- **Spam protection (v1):** a hidden honeypot field (`website`). If a bot fills
  it, the Worker returns success but files nothing. Turnstile is the planned
  upgrade — see issue #14.
- The front-end form (About page) POSTs `{ name, category, message, website }`
  to `/api/feedback`. Wire that up **after** this endpoint is live, so the live
  About page never points at a dead endpoint.
