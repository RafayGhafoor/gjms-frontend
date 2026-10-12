/* ==========================================================================
   Academic Nexus — theme controller
   Three states: light · system · dark. Persisted in localStorage under the
   key 'theme' (the same key the legacy theme.js reads, so state carries over).
   A tiny inline script in each page's <head> applies the theme before paint;
   this module owns switching and reacting to OS-level changes.
   ========================================================================== */

const STORAGE_KEY = 'theme';
const VALID = ['light', 'system', 'dark'];
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

export function getPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (VALID.includes(stored)) return stored;
  } catch (err) {
    /* storage blocked — fall back to system */
  }
  return 'system';
}

export function getResolved(pref = getPreference()) {
  if (pref === 'system') return darkQuery.matches ? 'dark' : 'light';
  return pref;
}

export function applyTheme(pref = getPreference()) {
  const resolved = getResolved(pref);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themeSource = pref;
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#000000' : '#ffffff');

  document.dispatchEvent(new CustomEvent('nexus:themechange', { detail: { preference: pref, resolved } }));
  return resolved;
}

export function setPreference(pref) {
  const next = VALID.includes(pref) ? pref : 'system';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (err) {
    /* ignore */
  }
  applyTheme(next);
  syncSwitches(next);
  return next;
}

/** Wire up every [data-theme-set] button inside scope. */
export function initThemeSwitch(scope = document) {
  const buttons = scope.querySelectorAll('[data-theme-set]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => setPreference(button.dataset.themeSet));
  });
  syncSwitches(getPreference());
  darkQuery.addEventListener('change', () => {
    if (getPreference() === 'system') applyTheme('system');
  });
}

function syncSwitches(pref) {
  document.querySelectorAll('[data-theme-set]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeSet === pref));
  });
}
