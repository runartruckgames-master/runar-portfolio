# Owner-only publishing API (not deployed)

This is a **backend implementation**, not a live admin login. The existing GitHub Pages editor remains local-draft-only until it is integrated and deployed.

## Deployment prerequisites

1. Create a Cloudflare Worker on a **custom domain** you control. GitHub Pages cannot host this API.
2. Protect `/api/*` with a Cloudflare Access application, allowing **only the owner's verified account**.
3. Configure `ACCESS_TEAM_DOMAIN` (e.g. `https://example.cloudflareaccess.com`), `ACCESS_AUD` (Access application audience), and `OWNER_EMAIL` as Worker environment variables.
4. Add `GITHUB_TOKEN` with **fine-grained Contents: Read and write access only to this repository**, as an encrypted Worker secret.
5. Install dependencies, run `npm run check`, and deploy. Test Access denial with an unauthenticated browser **before** connecting the editor.
6. Connect the editor only after deployment and security tests pass. No public client-side GitHub credentials.

## Implemented API

- `GET /api/content`: read published JSON plus GitHub blob SHA.
- `PUT /api/content`: publish validated content with optimistic revision checking.
- `PUT /api/photo`: publish a JPEG (maximum 2 MiB) to a fixed public photo path.

All operations require a verified Cloudflare Access JWT and an exact owner email match. An unconfigured backend rejects requests. Origin checks supplement but do not replace authentication. Published content and photos are **public**.

## Not yet implemented

- Hosted owner login, editor integration, upload of project photos/videos, automatic deployment and end-to-end browser tests.
- Rate limits, upload malware scanning, image re-encoding, audit logs and recovery UI.

Do not call this a finished admin panel until these are implemented and tested.
