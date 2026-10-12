/* ==========================================================================
   Academic Nexus — page chrome
   Mobile navigation, back-to-top, scroll reveal, footer year and the theme
   switch. Shared by every redesigned page.
   ========================================================================== */

import { initThemeSwitch } from './nexus-theme.js';

export function initChrome(scope = document) {
  initThemeSwitch(scope);
  initMobileNav(scope);
  initToTop(scope);
  initReveal(scope);
  initFooterYear(scope);
}

function initMobileNav(scope) {
  const toggle = scope.querySelector('[data-nav-toggle]');
  const panel = scope.querySelector('[data-nav-panel]');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };

  setOpen(false);

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Never leave a hidden panel behind on desktop widths.
  const desktop = window.matchMedia('(min-width: 60rem)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

function initToTop(scope) {
  const button = scope.querySelector('[data-to-top]');
  if (!button) return;

  const update = () => {
    button.hidden = window.scrollY < 700;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initReveal(scope) {
  const targets = scope.querySelectorAll('.reveal:not(.is-visible)');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  );

  targets.forEach((element) => observer.observe(element));
}

function initFooterYear(scope) {
  const year = new Date().getFullYear();
  scope.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(year);
  });
}
