# Hosting

| Piece       | Provider                                | Identifier                                                                 |
| ----------- | --------------------------------------- | -------------------------------------------------------------------------- |
| The app     | Cloudflare Workers, account `431a5290…` | Worker `arbor`, the `name` in `apps/worker/wrangler.jsonc`                 |
| Its data    | Cloudflare Durable Objects (SQLite)     | class `FamilyRoom`, binding `FAMILY_ROOMS`: one object per family          |
| Its address | Cloudflare DNS, zone `adrienlcp.com`    | custom-domain route `arbor.adrienlcp.com`, in `apps/worker/wrangler.jsonc` |

The Worker serves the built web app (`apps/web/dist`) as static assets and
answers the API; `workers_dev` is off, so `arbor.adrienlcp.com` is its only
address. The identifiers the scripts read are in
`scripts/operations/hosting.ts`. The CI secrets that let GitHub deploy to
Cloudflare are covered in [secrets.md](secrets.md).

## How it is created

The Worker exists; the CI's deploy step runs
`pnpm --filter @arbor/worker exec wrangler deploy`, which uploads a new
version on each run, applies the Durable Object `migrations` not yet applied,
and keeps the custom domain declared in `apps/worker/wrangler.jsonc` attached,
with its DNS record and certificate:

```jsonc
{
  "name": "arbor",
  "routes": [{ "custom_domain": true, "pattern": "arbor.adrienlcp.com" }]
}
```

## A Worker deleted by mistake

CI cannot bring it back: `ADMIN_KEY` is a required secret, and wrangler
refuses to create a Worker without it (`The following required secrets have
not been set: ADMIN_KEY … This Worker does not exist yet`). Its families are
gone with it: deleting the Worker deletes their Durable Objects.

Recreate it by hand, from a clean clone of `main`, in a terminal set up as in
_Worker secrets_ below, the secret handed over through a file deleted right
after:

```powershell
pnpm install --frozen-lockfile; pnpm build
```

```powershell
$secrets = Join-Path $env:TEMP "arbor-secrets.json"; @{ ADMIN_KEY = (bw get password "arbor ADMIN_KEY") } | ConvertTo-Json | Set-Content $secrets; pnpm --filter @arbor/worker exec wrangler deploy --secrets-file $secrets; Remove-Item $secrets
```

The custom domain answers once its certificate is issued, a few minutes
later. From then on, CI deploys as before.

## Worker secrets

The Worker reads one secret, `ADMIN_KEY`: the publisher's key for erasing a
person ([`docs/data-model.md`](../data-model.md)). `wrangler.jsonc` lists it
under `secrets.required`: a deploy fails while the Worker lacks it. Its value
is the Bitwarden entry `arbor ADMIN_KEY` ([secrets.md](secrets.md)).

Unlock first ([secrets.md](secrets.md), _Unlocking_), then in that terminal:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "431a529079f2d76802b95056e39950f0"; $env:CLOUDFLARE_API_TOKEN = bw get password "Cloudflare Pages token"
```

```powershell
bw get password "arbor ADMIN_KEY" | pnpm --filter @arbor/worker exec wrangler secret put ADMIN_KEY
```

Expected: `Success! Uploaded secret ADMIN_KEY`. Close the terminal afterwards:
it holds the token.

## Deploy by hand

The last resort, when CI cannot deploy: from a clean clone of `main` only (it
ships whatever the folder holds), in a terminal set up as in _Worker secrets_:

```powershell
pnpm install --frozen-lockfile
```

```powershell
pnpm build
```

```powershell
pnpm --filter @arbor/worker exec wrangler deploy
```

`pnpm build` comes first: the Worker uploads `apps/web/dist` as its assets.

## Common errors

| Message                                                          | Fix                                                                                                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `Bitwarden …` message                                          | See [secrets.md](secrets.md).                                                                                                                                        |
| `Authentication error [code: 10000]`                             | The Cloudflare token lacks a permission listed in [secrets.md](secrets.md), or expired: renew it.                                                                    |
| `The following required secrets have not been set: ADMIN_KEY`    | The Worker exists but lacks it: set it as in _Worker secrets_, then re-run the deploy. With `This Worker does not exist yet`: _A Worker deleted by mistake_.         |
| `wrangler deploy` refuses the custom domain: a DNS record exists | A record already holds `arbor.adrienlcp.com`: in the dashboard, _adrienlcp.com → DNS → Records_, delete it, then re-run the deploy.                                  |
| The site answers `522` or a certificate error                    | The certificate is not issued yet: wait ten minutes. Still failing: dashboard → _Workers & Pages → arbor → Settings → Domains & Routes_, and follow what it reports. |
