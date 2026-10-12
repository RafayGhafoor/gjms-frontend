import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Static SvelteKit build for GitHub Pages (custom domain gjmsweb.com, no base path).
 *
 * URL parity is a hard requirement: the published URLs must stay identical to the
 * current site (`/archive.html`, `/current-issue.html`, …). Routes whose folder name
 * ends in `.html` therefore emit `build/<name>.html`.
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    prerender: {
      entries: ['*'],
      handleHttpError: 'fail'
    },
    alias: {
      $lib: 'src/lib',
      // The journal's data files stay at the repository root (the automation
      // writes archive-data.json there), so alias them for clean imports.
      $archive: 'archive-data.json',
      $content: 'content.json'
    }
  }
};

export default config;
