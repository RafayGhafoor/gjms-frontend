#!/usr/bin/env node
/**
 * Put gjmsweb.com behind Cloudflare, in front of GitHub Pages.
 *
 *   node scripts/cloudflare/cloudflare.mjs plan              # audit, no credentials
 *   node scripts/cloudflare/cloudflare.mjs apply --dry-run   # show the API calls
 *   CF_API_TOKEN=… node scripts/cloudflare/cloudflare.mjs apply
 *   node scripts/cloudflare/cloudflare.mjs verify            # post-switch checks
 *
 * Why this exists: GitHub Pages serves every asset with `Cache-Control:
 * max-age=600` and offers no way to override it. That is the one real,
 * unfixable-on-Pages performance finding in the Lighthouse/PSI audit — content
 * hashed build assets and the self-hosted fonts are re-validated every 10
 * minutes for every returning reader. Cloudflare in front lets us set an
 * immutable browser TTL on the hashed assets and add baseline security headers,
 * which Pages cannot do either.
 *
 * The `apply` subcommand is idempotent and *additive*: it creates or updates
 * exactly five DNS records and the rulesets it owns, and it never deletes or
 * rewrites a record it did not create. That matters, because the zone it lands
 * in is the same zone that will carry the GitHub Pages custom-domain
 * verification TXT record, and losing that record can silently detach the
 * custom domain from the repository.
 */

import { promises as dns } from 'node:dns';

/* ------------------------------------------------------------------ config */

const ZONE = 'gjmsweb.com';
const APEX = 'gjmsweb.com';
const WWW = 'www.gjmsweb.com';

/** The origin: GitHub Pages' four apex addresses for a custom domain. */
const GITHUB_PAGES_A = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];

/** Content-hashed by Vite, so a changed file has a changed name: safe to pin. */
const IMMUTABLE_PATHS = ['/_app/immutable/'];

/**
 * Stable-but-not-hashed paths. Their *contents* can change at the same URL
 * (re-running scripts/fetch-fonts.mjs after Google revises a face rewrites
 * latin-300-700.woff2 in place), so these get 30 days rather than a year.
 * Hashing the font filenames would justify a year; that is a follow-up, and
 * doing it during a nameserver migration would be unwise.
 */
const STABLE_ASSET_PATHS = ['/fonts/', '/brand/'];
const STABLE_ASSET_FILES = ['/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/favicon-32.png', '/favicon-32-dark.png', '/favicon.ico', '/og-image.jpg', '/site.webmanifest'];

const YEAR = 31_536_000;
const MONTH = 2_592_000;

/** Zone settings worth asserting. Anything not here is left at Cloudflare's default. */
const SETTINGS = {
  /* GitHub Pages presents a publicly trusted certificate for the custom domain,
     so Full (strict) validates end to end. Flexible would loop: Cloudflare would
     talk plain HTTP to an origin that redirects every request to HTTPS. */
  ssl: 'strict',
  always_use_https: 'on',
  automatic_https_rewrites: 'on',
  min_tls_version: '1.2',
  tls_1_3: 'on',
  opportunistic_encryption: 'on',
  brotli: 'on',
  http3: 'on',
  /* 0-RTT can replay non-idempotent requests; nothing here benefits from it. */
  '0rtt': 'off'
};

const API = 'https://api.cloudflare.com/client/v4';

/* ------------------------------------------------------------------- utils */

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`
};

function header(title) {
  console.log(`\n${c.bold(title)}`);
  console.log('─'.repeat(title.length));
}

/* --------------------------------------------------------------- CF client */

class Cloudflare {
  constructor(token, { dryRun = false } = {}) {
    this.token = token;
    this.dryRun = dryRun;
    this.calls = 0;
  }

  async request(method, path, body) {
    this.calls++;
    if (this.dryRun) {
      console.log(`  ${c.yellow('DRY')} ${method} ${path}${body ? ` ${c.dim(JSON.stringify(body))}` : ''}`);
      if (method === 'GET') return { result: [], result_info: {}, success: true };
      return { result: { id: 'dry-run' }, success: true };
    }
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${this.token}`,
        'content-type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      const detail = (payload.errors || []).map((e) => `${e.code} ${e.message}`).join('; ') || response.statusText;
      throw new Error(`${method} ${path} → ${response.status}: ${detail}`);
    }
    return payload;
  }

  get = (path) => this.request('GET', path);
  post = (path, body) => this.request('POST', path, body);
  patch = (path, body) => this.request('PATCH', path, body);
  put = (path, body) => this.request('PUT', path, body);

  async zoneId() {
    const { result } = await this.get(`/zones?name=${ZONE}`);
    if (!result?.length) {
      throw new Error(
        `Zone ${ZONE} is not in this account. Add the site in the Cloudflare dashboard first ` +
          `(see scripts/cloudflare/README.md step 1).`
      );
    }
    return result[0].id;
  }
}

/* -------------------------------------------------------------------- plan */

async function liveAnswers(name, type) {
  try {
    if (type === 'A') return (await dns.resolve4(name)).sort();
    if (type === 'CNAME') return await dns.resolveCname(name);
    if (type === 'TXT') return await dns.resolveTxt(name);
    if (type === 'NS') return (await dns.resolveNs(name)).sort();
  } catch (error) {
    return { error: error.code || error.message };
  }
  return null;
}

async function plan() {
  header(`DNS currently published for ${ZONE}`);
  const ns = await liveAnswers(ZONE, 'NS');
  const a = await liveAnswers(ZONE, 'A');
  const wwwA = await liveAnswers(WWW, 'A');
  console.log(`  NS   ${Array.isArray(ns) ? ns.join('\n       ') : JSON.stringify(ns)}`);
  console.log(`  A    ${Array.isArray(a) ? a.join(', ') : JSON.stringify(a)}`);
  console.log(`  www  ${Array.isArray(wwwA) ? wwwA.join(', ') : JSON.stringify(wwwA)}`);

  const onCloudflare = Array.isArray(ns) && ns.every((s) => s.endsWith('.ns.cloudflare.com'));
  console.log(`\n  ${onCloudflare ? c.green('Zone is already on Cloudflare nameservers.') : c.yellow('Zone is NOT on Cloudflare nameservers yet — this is a nameserver migration.')}`);

  header('Records `apply` will create or update (nothing else is touched)');
  for (const ip of GITHUB_PAGES_A) console.log(`  A      ${APEX.padEnd(16)} → ${ip}   ${c.dim('proxied')}`);
  console.log(`  CNAME  ${WWW.padEnd(16)} → ${APEX}   ${c.dim('proxied')}  ${c.green('(currently does not resolve at all)')}`);

  header('Cache rules');
  for (const p of IMMUTABLE_PATHS) console.log(`  ${p.padEnd(18)} browser + edge TTL ${YEAR}s  ${c.dim('content-hashed by Vite')}`);
  for (const p of [...STABLE_ASSET_PATHS, ...STABLE_ASSET_FILES]) console.log(`  ${p.padEnd(18)} browser TTL ${MONTH}s ${c.dim('')}`);

  header('Zone settings');
  for (const [key, value] of Object.entries(SETTINGS)) console.log(`  ${key.padEnd(24)} ${value}`);

  header('Records that MUST survive the migration (verify after the import)');
  console.log('  Any TXT records — SPF / DMARC, Google site verification, and especially');
  console.log(`  _github-pages-challenge-<owner>.${ZONE}`);
  console.log('  Losing the GitHub Pages challenge record can silently detach the custom');
  console.log('  domain from the repository.');
  console.log('\n  I could not enumerate them: the current authoritative nameservers do not');
  console.log('  answer TXT queries at all (A/NS/SOA answer, TXT times out), so the');
  console.log('  Cloudflare zone import is the only complete source. Audit it before you');
  console.log('  change nameservers — see scripts/cloudflare/README.md step 2.');
}

/* ------------------------------------------------------------------- apply */

function recordKey(record) {
  return `${record.type} ${record.name}`;
}

async function apply({ dryRun, hsts, csp }) {
  const token = process.env.CF_API_TOKEN;
  if (!token && !dryRun) {
    console.error(c.red('CF_API_TOKEN is not set. Export a scoped token (see scripts/cloudflare/README.md step 3).'));
    process.exit(1);
  }

  const cf = new Cloudflare(token, { dryRun });
  /* In dry-run there is no token and therefore no zone lookup — print the whole
     plan against a placeholder id instead of failing on the missing zone. */
  let zone = '<zone-id>';
  if (!dryRun) {
    try {
      zone = await cf.zoneId();
    } catch (error) {
      console.error(c.red(error.message));
      process.exit(1);
    }
  }
  console.log(`${c.bold(`Applying Cloudflare configuration to ${ZONE}`)} ${c.dim(`(zone ${zone})`)}`);

  /* ---- 1. DNS -------------------------------------------------------- */
  header('DNS records');
  const existing = dryRun ? [] : (await cf.get(`/zones/${zone}/dns_records?per_page=100`)).result;
  const byKey = new Map(existing.map((r) => [recordKey(r), r]));

  const wanted = [
    ...GITHUB_PAGES_A.map((ip) => ({ type: 'A', name: APEX, content: ip })),
    { type: 'CNAME', name: WWW, content: APEX }
  ];

  for (const want of wanted) {
    const found = byKey.get(recordKey(want));
    if (!found) {
      console.log(`  ${c.green('create')} ${want.type} ${want.name} → ${want.content} (proxied)`);
      await cf.post(`/zones/${zone}/dns_records`, { ...want, proxied: true, ttl: 1 });
    } else if (!found.proxied) {
      console.log(`  ${c.green('enable proxy')} ${want.type} ${want.name} → ${found.content}`);
      await cf.patch(`/zones/${zone}/dns_records/${found.id}`, { proxied: true });
    } else {
      console.log(`  ${c.dim('ok')}     ${want.type} ${want.name} → ${found.content} (already proxied)`);
    }
  }

  const preserved = existing.filter(
    (r) => !wanted.some((w) => recordKey(w) === recordKey(r))
  );
  console.log(
    `  ${c.dim(`${preserved.length} other record(s) in the zone left untouched${
      preserved.length ? `: ${preserved.map((r) => `${r.type} ${r.name}`).join(', ')}` : ''
    }`)}`
  );

  /* ---- 2. Zone settings --------------------------------------------- */
  header('Zone settings');
  for (const [setting, value] of Object.entries(SETTINGS)) {
    if (dryRun) {
      console.log(`  ${c.yellow('DRY')} PATCH /zones/${zone}/settings/${setting} {"value":"${value}"}`);
      continue;
    }
    const current = (await cf.get(`/zones/${zone}/settings/${setting}`)).result;
    if (String(current.value) === String(value)) {
      console.log(`  ${c.dim('ok')}     ${setting} = ${value}`);
      continue;
    }
    console.log(`  ${c.green('set')}    ${setting} = ${value} ${c.dim(`(was ${current.value})`)}`);
    await cf.patch(`/zones/${zone}/settings/${setting}`, { value });
  }

  if (hsts) {
    /* GitHub Pages ALREADY sends `strict-transport-security: max-age=31556952`
       (one year). So this is not an addition, it is a guarantee that survives
       being proxied — and it must not be shorter than what the origin sends, or
       turning it on would downgrade the header. One year, no preload (a one-way
       door into the browser preload list), no includeSubDomains. */
    console.log(`  ${c.green('set')}    security_header (HSTS, 1 year — parity with GitHub Pages)`);
    await cf.patch(`/zones/${zone}/settings/security_header`, {
      value: {
        strict_transport_security: {
          enabled: true,
          max_age: YEAR,
          include_subdomains: false,
          preload: false,
          nosniff: true
        }
      }
    });
  } else {
    console.log(
      `  ${c.dim('skip')}   security_header (HSTS) — GitHub Pages already sends max-age=31556952;`
    );
    console.log(`  ${c.dim('       pass --hsts to enforce the same header at the edge')}`);
  }

  /* ---- 3. Cache rules ----------------------------------------------- */
  header('Cache rules');
  const immutableExpression = `(${IMMUTABLE_PATHS.map((p) => `starts_with(http.request.uri.path, "${p}")`).join(' or ')})`;
  const stableExpression = `(${STABLE_ASSET_PATHS.map((p) => `starts_with(http.request.uri.path, "${p}")`).join(' or ')} or ${STABLE_ASSET_FILES.map((f) => `http.request.uri.path eq "${f}"`).join(' or ')})`;

  const cacheRules = [
    {
      description: 'Immutable content-hashed build assets',
      expression: immutableExpression,
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: { mode: 'override_origin', default: YEAR },
        browser_ttl: { mode: 'override_origin', default: YEAR }
      }
    },
    {
      description: 'Fonts, brand art and icons (stable paths, 30 days)',
      expression: stableExpression,
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: { mode: 'override_origin', default: MONTH },
        browser_ttl: { mode: 'override_origin', default: MONTH }
      }
    }
  ];
  if (dryRun) {
    for (const rule of cacheRules) console.log(`  ${c.yellow('DRY')} ${rule.description}`);
  } else {
    await cf.put(`/zones/${zone}/rulesets/phases/http_request_cache_settings/entrypoint`, {
      rules: cacheRules
    });
    for (const rule of cacheRules) console.log(`  ${c.green('set')}    ${rule.description}`);
  }

  /* ---- 4. www → apex ------------------------------------------------- */
  header('www → apex redirect');
  const redirectRules = [
    {
      description: 'www to apex (301)',
      expression: `(http.host eq "${WWW}")`,
      action: 'redirect',
      action_parameters: {
        from_value: {
          status_code: 301,
          target_url: { expression: `concat("https://${APEX}", http.request.uri.path)` },
          preserve_query_string: true
        }
      }
    }
  ];
  if (dryRun) {
    console.log(`  ${c.yellow('DRY')} PUT /zones/${zone}/rulesets/phases/http_request_dynamic_redirect/entrypoint`);
  } else {
    await cf.put(`/zones/${zone}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
      rules: redirectRules
    });
    console.log(`  ${c.green('set')}    www→apex 301, path and query preserved`);
  }

  /* ---- 5. Response headers ------------------------------------------ */
  header('Response headers');
  const headers = {
    'x-content-type-options': { operation: 'set', value: 'nosniff' },
    'referrer-policy': { operation: 'set', value: 'strict-origin-when-cross-origin' },
    'permissions-policy': { operation: 'set', value: 'geolocation=(), camera=(), microphone=()' },
    'x-frame-options': { operation: 'set', value: 'SAMEORIGIN' }
  };
  const headerRules = [
    {
      description: 'Baseline security headers',
      expression: 'true',
      action: 'rewrite',
      action_parameters: { headers }
    }
  ];
  if (csp) {
    /* Report-only: violates nothing, breaks nothing, and starts producing data
       if a report endpoint is ever added. The site needs no inline script except
       the theme bootstrap and the JSON-LD block, both of which are declared here. */
    headerRules.push({
      description: 'CSP report-only (observability)',
      expression: 'true',
      action: 'rewrite',
      action_parameters: {
        headers: {
          'content-security-policy-report-only': {
            operation: 'set',
            value:
              "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
              "script-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'self'; form-action 'self'; " +
              "frame-ancestors 'self'"
          }
        }
      }
    });
  }
  if (dryRun) {
    for (const rule of headerRules) console.log(`  ${c.yellow('DRY')} ${rule.description}`);
  } else {
    await cf.put(`/zones/${zone}/rulesets/phases/http_response_headers_transform/entrypoint`, {
      rules: headerRules
    });
    for (const rule of headerRules) console.log(`  ${c.green('set')}    ${rule.description}`);
  }

  console.log(`\n${c.green('Done.')} ${cf.calls} API call(s). Now run: node scripts/cloudflare/cloudflare.mjs verify`);
}

/* ------------------------------------------------------------------ verify */

async function check(label, url, expect = {}) {
  try {
    const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'gjms-cf-verify' } });
    const get = (h) => response.headers.get(h);
    const line = [`${response.status}`.padStart(3), label.padEnd(34)];
    for (const [name, key] of Object.entries(expect)) {
      const actual = get(key) || '(absent)';
      line.push(`${name}=${String(actual).slice(0, 46)}`);
    }
    console.log(line.join('  '));
    return { status: response.status, headers: response.headers };
  } catch (error) {
    console.log(`  !! ${label}: ${error.message}`);
    return null;
  }
}

async function verify() {
  header('Edge identity');
  console.log(`  NS  ${(await liveAnswers(ZONE, 'NS')).join(', ')}`);
  const apex = await fetch(`https://${APEX}/`, { headers: { 'user-agent': 'gjms-verify' } });
  console.log(`  server: ${apex.headers.get('server')}  cf-ray: ${apex.headers.get('cf-ray') || c.red('(absent — not proxied or DNS not switched yet)')}`);

  header('Cache headers (the point of the exercise)');
  /* The hashed filenames change every build, so ask the HTML what to fetch. */
  const html = await (await fetch(`https://${APEX}/`, { headers: { 'user-agent': 'gjms-verify' } })).text();
  const asset = html.match(/\/_app\/immutable\/[A-Za-z0-9/._-]+\.(?:js|css)/)?.[0];
  if (asset) {
    await check(asset, `https://${APEX}${asset}`, { 'cache-control': 'cache-control' });
  } else {
    console.log(`  ${c.red('could not find a hashed asset in the HTML')}`);
  }
  const font = html.match(/\/fonts\/[A-Za-z0-9/._-]+\.woff2/)?.[0] || '/fonts/source-serif-4/latin-300-700.woff2';
  await check(font, `https://${APEX}${font}`, { 'cache-control': 'cache-control' });

  header('Security headers');
  for (const h of ['x-content-type-options', 'referrer-policy', 'permissions-policy', 'strict-transport-security']) {
    console.log(`  ${h.padEnd(30)} ${apex.headers.get(h) || c.dim('(absent)')}`);
  }

  header('www redirect + pages');
  await check('www → apex', `https://${WWW}/archive.html`, { location: 'location' });
  for (const path of ['/', '/archive.html', '/articles.html', '/current-issue.html', '/editorial-board.html', '/author-guideline.html', '/impact-factor.html', '/vision-mission.html', '/contact.html', '/robots.txt', '/sitemap.xml', '/llms.txt']) {
    const r = await check(path, `https://${APEX}${path}`);
    if (r && r.status !== 200) console.log(`     ${c.red('expected 200')}`);
  }

  header('Content sanity (the redesign must survive the proxy)');
  const home = await (await fetch(`https://${APEX}/`, { headers: { 'user-agent': 'gjms-verify' } })).text();
  const probes = {
    'hero heading present': /Global Journal of Management, Social Sciences and Humanities/.test(home),
    'font sheet linked': /font-faces\.css/.test(home),
    'canonical is apex': /rel="canonical" href="https:\/\/gjmsweb\.com\/"/.test(home),
    'no www in canonicals': !/rel="canonical" href="https:\/\/www\./.test(home)
  };
  for (const [label, ok] of Object.entries(probes)) console.log(`  ${ok ? c.green('ok  ') : c.red('FAIL')} ${label}`);
}

/* -------------------------------------------------------------------- main */

const [command = 'plan', ...flags] = process.argv.slice(2);
const has = (flag) => flags.includes(flag);

if (command === 'plan') await plan();
else if (command === 'apply') await apply({ dryRun: has('--dry-run'), hsts: has('--hsts'), csp: has('--csp') });
else if (command === 'verify') await verify();
else {
  console.log('usage: cloudflare.mjs <plan|apply|verify> [--dry-run] [--hsts] [--csp]');
  process.exit(1);
}
