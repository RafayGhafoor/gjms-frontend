# Putting gjmsweb.com behind Cloudflare

This directory holds the tooling for the one performance item the audit could
not fix from inside the repository.

## Why

GitHub Pages serves **every** asset with `Cache-Control: max-age=600` and offers
no way to override it. That includes the Vite content-hashed files under
`/_app/immutable/` — whose names change whenever their contents do, so they are
safe to cache for a year — and the self-hosted fonts. Lighthouse/PSI measured
this as "Est savings of ~200–250 KiB" on repeat visits, and it is the only
finding in the report that cannot be fixed by editing this repo.

Cloudflare in front also lets us do three things Pages cannot:

- an immutable browser TTL on the hashed build assets, so returning readers
  re-download nothing;
- baseline security response headers (`X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`);
- a `www` host, which currently **does not resolve at all**, redirected 301 to
  the apex so nobody lands on a dead `www.gjmsweb.com`.

## What it does not change

- The origin stays GitHub Pages. Nothing about the build, the deploy workflow,
  the URLs, the sitemap or the content changes.
- No existing DNS record is deleted or rewritten. `apply` creates or updates
  **exactly five** records (the four apex `A`s and `www`) and lists everything
  else it left alone.

## This is a nameserver migration — the risks, honestly

The zone is currently served by `abnet.{earth,mars,mercury,venus}.orderbox-dns.com`
(LogicBoxes/ResellerClub white-label DNS). Cloudflare can only proxy a zone it is
authoritative for, so the nameservers at the registrar must change. That is a
real production change to a live journal domain, and it carries these risks:

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Losing a TXT record | **The GitHub Pages custom-domain verification record `_github-pages-challenge-<owner>.gjmsweb.com` must survive.** If it disappears, GitHub can detach `gjmsweb.com` from the repository and the site goes back to `*.github.io`. | Audit every imported record against the registrar's zone export *before* switching nameservers (step 2). |
| Losing mail DNS | No `MX` records exist today and no TXT records are resolvable, so there is nothing to lose — but confirm from the export, not from my probes. | Same. |
| Downtime while propagating | The `A` records are cached with a ~4.4 h TTL. | Lower the TTLs to 300 s at least a day before switching (step 0). |
| SSL redirect loop | Cloudflare's **Flexible** mode makes the edge speak plain HTTP to an origin that redirects everything to HTTPS → infinite loop. | `apply` sets SSL to **Full (strict)**; never set it back to Flexible. |
| The current DNS is already degraded | Its authoritative servers **answer `A`/`NS`/`SOA` but do not answer `TXT` at all** — every public resolver times out. Any SPF/DMARC/verification record is currently unresolvable. | Independent reason to move; also why I could not enumerate TXT records for you. |

**Registrar:** the domain is registered with *PDR Ltd. / PublicDomainRegistry.com*
(IANA 303), but the `abnet.*.orderbox-dns.com` nameservers indicate it is managed
through a **reseller** of that registrar, and the zone's `SOA` contact is
`farazawan08@gmail.com`. So the nameserver change likely has to happen in a
reseller control panel, not PDR's — check who owns that reseller account first.
The domain is `clientTransferProhibited`, which does not block an NS change.

## Rollback

Revert the nameservers at the registrar to the four `abnet.*.orderbox-dns.com`
values. Nothing in this repository or in the GitHub Pages configuration is
touched by the migration, so reverting DNS is a complete rollback. The Cloudflare
zone can be left in place (inactive) or deleted afterwards.

---

## Step 0 — lower the TTLs (do this a day ahead)

In the current DNS panel, set the `A` record TTLs to 300 s so the switch-over
window is minutes rather than hours. If the reseller panel does not expose TTLs,
skip this and accept a propagation window of up to ~4.4 h.

## Step 1 — add the site to Cloudflare

1. Cloudflare dashboard → **Add a site** → `gjmsweb.com` → Free plan.
2. Let Cloudflare scan the existing DNS. **Do not change nameservers yet.**
3. Note the two assigned nameservers — you will need them in step 5.

## Step 2 — audit the imported records (the important one)

Compare the Cloudflare-imported list against the registrar's DNS zone export.
Every record that exists today must exist in Cloudflare. In particular, confirm
the presence of:

- `_github-pages-challenge-<owner>.gjmsweb.com` **TXT** — GitHub Pages domain
  verification. **If it is missing, add it back before switching.**
- any `google-site-verification` / other ownership TXT records
- `MX` / SPF / DKIM / DMARC records if the domain ever receives mail
  (none are resolvable today, but trust the export, not my probe)
- any `CAA` records (none exist today — Cloudflare's Universal SSL will need to
  be able to issue, so leave CAA absent unless you add one that permits the
  CAs Cloudflare uses)

`node scripts/cloudflare/cloudflare.mjs plan` prints the site records for
comparison.

## Step 3 — create a scoped API token

Cloudflare dashboard → **My Profile → API Tokens → Create Token → Custom token**.

Permissions (all with **Edit** unless noted):

| Group | Permission |
| --- | --- |
| Zone | Zone — **Read** |
| Zone | DNS — Edit |
| Zone | Zone Settings — Edit |
| Zone | Cache Rules — Edit |
| Zone | Transform Rules — Edit |
| Zone | Dynamic Redirect — Edit |

**Zone Resources:** Include → Specific zone → `gjmsweb.com`.

Then:

```bash
export CF_API_TOKEN='…'          # never commit this
node scripts/cloudflare/cloudflare.mjs apply --dry-run   # review the plan
node scripts/cloudflare/cloudflare.mjs apply
```

Do this **before** the nameserver change: the rules and settings are stored on
the zone and will simply start taking effect once Cloudflare is authoritative.

Optional flags:

- `--hsts` — enforce HSTS at the edge. Off by default because **GitHub Pages
  already sends `strict-transport-security: max-age=31556952` (one year)**, so
  there is nothing to add; the flag exists to guarantee the header survives
  being proxied, and it deliberately matches the origin's one year rather than
  shortening it to Cloudflare's default.
- `--csp` — add a `Content-Security-Policy-Report-Only` header. Report-only
  breaks nothing and starts producing violations if a report endpoint is added
  later.

## Step 4 — verify the rules are staged

Cloudflare dashboard → the zone → **Caching → Cache Rules** and
**Rules → Transform Rules / Redirect Rules** should show the three rulesets.

## Step 5 — change the nameservers at the registrar

Replace all four `abnet.*.orderbox-dns.com` nameservers with the two Cloudflare
nameservers from step 1. Propagation is typically minutes.

## Step 6 — verify

```bash
node scripts/cloudflare/cloudflare.mjs plan     # NS should now be *.ns.cloudflare.com
node scripts/cloudflare/cloudflare.mjs verify
```

`verify` checks, against the live site: edge identity (`server` / `cf-ray`), the
`cache-control` actually returned for a hashed asset and for a font, the security
headers, the `www` → apex 301, all nine pages plus `robots.txt` / `sitemap.xml` /
`llms.txt` returning 200, and that the redesign survived the proxy (hero heading
present, canonical still the apex, no `www` canonicals).

Also confirm in GitHub: **Settings → Pages** must still show the custom domain
`gjmsweb.com` with a verified checkmark. If it shows unverified, the challenge
TXT record was lost in step 2 — restore it.

## Step 7 — re-measure

Re-run PageSpeed Insights for `https://gjmsweb.com/`. The repeat-visit cache
finding should be gone. First-load scores will not move much: this change is
about returning readers, not the lab measurement.

---

## Follow-ups once the migration has settled

1. **Hash the font filenames** (`latin-300-700.<hash>.woff2`) in
   `scripts/fetch-fonts.mjs`, then raise `/fonts/` to a one-year immutable TTL.
   The reason it is 30 days today is that re-running the script after Google
   revises a face rewrites the same path.
2. **Add `www.gjmsweb.com` to `SITE.origin` redirect expectations** if the
   journal ever advertises the `www` form; canonicals deliberately stay on the
   apex.
3. Consider moving the PDFs (`gjms.b-cdn.net`) behind the same zone with a
   Cloudflare cache rule, so the article PDFs get the same treatment. Note the
   current `robots.txt` cannot govern that origin.
