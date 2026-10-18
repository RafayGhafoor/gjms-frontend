# Putting gjmsweb.com behind Cloudflare

This directory holds the tooling for the one performance item the audit could
not fix from inside the repository.

## Current state (2026-10-15)

The zone is created and fully staged. **Nothing is live yet** — DNS for gjmsweb.com
is still served by the old nameservers, so every rule below is inert until the
registrar is switched. `cf:apply` is idempotent, so re-running it is safe.

| | |
| --- | --- |
| Zone | `gjmsweb.com` · `d3b7d6ea47a714568964eaa3e6a8d9f0` (account *Rafayghafoor@gmail.com*, id `120f4f205e32689b9d8f270f51e382e4`) |
| Nameservers to set at the registrar | **`donald.ns.cloudflare.com`** and **`jamie.ns.cloudflare.com`** |
| Status | `pending` — waiting only on the nameserver change |
| Records created | the four GitHub Pages apex `A`s plus a `www` CNAME, all proxied |
| Rules staged | 2 cache rules (1 y immutable on `/_app/immutable/`, 30 d on `/fonts/` + `/brand/` + icons), a `www`→apex 301, and a response-header rule (`x-content-type-options`, `referrer-policy`, `permissions-policy`, `x-frame-options`) |
| Zone settings | SSL `full` → **`strict`**, Always Use HTTPS `off` → **`on`**, min TLS `1.0` → **`1.2`**, TLS 1.3, Brotli, HTTP/3 on, 0-RTT off |

### The DNS import returned ZERO records — this is the one thing to fix

Cloudflare's importer reads the existing zone over DNS, and the current
authoritative servers answer `A`/`NS`/`SOA` but **do not answer `TXT` at all**. So
nothing was imported; the five site records above were created explicitly from the
independently verified set instead. **Every other record the zone holds — above all
the GitHub Pages domain-verification `TXT` — must be read out of the
registrar/reseller panel and re-created in Cloudflare before the switch.**

GitHub currently reports the domain as **verified**
(`protected_domain_state: "verified"`, `pending_domain_unverified_at: null`), so
there is no fire today — but GitHub re-checks the domain periodically, and that
check will fail if the record is not in the new zone. Its HTTPS certificate also
expires **2026-11-19** and renews against the live DNS.

### Also worth knowing

- The certificate renewal uses an HTTP challenge at `/.well-known/acme-challenge/`,
  which none of the cache rules match — so the renewal keeps working through the
  proxy.
- The site's own `robots.txt` cannot govern `gjms.b-cdn.net`, where the PDFs live.
- Two different Cloudflare accounts exist in this picture: the zone lives in
  *Rafayghafoor@gmail.com's Account*, while the first token tried belonged to
  *Gualdi LLC* (which holds three unrelated zones). Make sure every future token
  is scoped to the account that holds the zone.

---

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

## Step 1 — the zone (already done)

Created via `POST /zones` with `jump_start: true`. The assigned nameservers are
`donald.ns.cloudflare.com` and `jamie.ns.cloudflare.com`.

## Step 2 — recreate the records the import could not read (do this first)

Open the **registrar/reseller DNS panel** — not a DNS query, because the current
nameservers do not answer `TXT` — and copy out every record:

- `_github-pages-challenge-<owner>.gjmsweb.com` **TXT** — GitHub Pages domain
  verification. GitHub's Settings → Pages shows the exact name and value if the
  domain is in an unverified state. **Without this, the custom domain can detach
  from the repository and the site reverts to `*.github.io`.**
- any `google-site-verification` / other ownership `TXT` records
- `MX` / SPF / DKIM / DMARC, if the domain ever receives mail
  (none are resolvable today, but trust the panel, not a probe)
- any `CAA` records (none exist today; Cloudflare's Universal SSL needs to be able
  to issue, so leave `CAA` absent unless you add one permitting its CAs)

Add each one to the new Cloudflare zone (`cf:apply` will never delete or rewrite
anything it did not create, so this is additive). Then run
`npm run cf:plan` and confirm the nameserver list has changed before moving on.

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
