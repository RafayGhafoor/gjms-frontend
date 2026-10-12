import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/**
 * abstracts.json lives at the repository root because the gjms-automation
 * pipeline writes it there. The listing pages fetch it lazily at runtime, so it
 * also has to exist as a static asset — this copies it into static/ (generated,
 * git-ignored) on every dev start and build, keeping one source of truth.
 */
function publishJournalData(): Plugin {
  const source = resolve('abstracts.json');
  const target = resolve('static/abstracts.json');

  const copy = () => {
    if (!existsSync(source)) return;
    mkdirSync(resolve('static'), { recursive: true });
    const current = existsSync(target) ? statSync(target).mtimeMs : 0;
    if (statSync(source).mtimeMs !== current) {
      copyFileSync(source, target);
      console.log('[journal-data] static/abstracts.json updated from abstracts.json');
    }
  };

  return {
    name: 'gjms-publish-journal-data',
    buildStart() {
      copy();
    },
    configureServer() {
      copy();
    }
  };
}

export default defineConfig({
  plugins: [publishJournalData(), tailwindcss(), sveltekit()],
  build: {
    // Keeps the prerendered HTML readable in build/ for SEO inspection.
    minify: true
  }
});
