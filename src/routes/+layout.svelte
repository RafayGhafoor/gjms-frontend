<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import Header from '$lib/components/site/header.svelte';
  import Footer from '$lib/components/site/footer.svelte';
  import ToTop from '$lib/components/site/to-top.svelte';

  let { children } = $props();
</script>

<!-- The light editorial theme is the default identity; "system" stays available
     through the header toggle, and a stored preference always wins. -->
<ModeWatcher defaultMode="light" />

<a
  class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:z-100 focus:-translate-x-1/2 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
  href="#main"
>
  Skip to content
</a>

<Header />

<main id="main" class="flex-1 focus:outline-none" tabindex="-1">
  {@render children()}
</main>

<Footer />
<ToTop />
