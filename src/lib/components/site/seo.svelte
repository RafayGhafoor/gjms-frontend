<script lang="ts">
  import { SITE, absoluteUrl } from '$lib/config/site';
  import { graph, organizationNode, periodicalNode, websiteNode } from '$lib/seo';

  /* One place for every <head> tag: title, description, canonical, social cards
     and JSON-LD. Pages pass their own title/description and any extra schema. */
  let {
    title,
    description,
    path,
    appendSiteName = true,
    type = 'website',
    image = '/favicon.svg',
    jsonLd = [],
    includeSiteGraph = true,
    publishedTime,
    modifiedTime
  }: {
    title: string;
    description: string;
    path: string;
    appendSiteName?: boolean;
    type?: 'website' | 'article' | 'profile';
    image?: string;
    jsonLd?: (Record<string, unknown> | null | undefined)[];
    includeSiteGraph?: boolean;
    publishedTime?: string;
    modifiedTime?: string;
  } = $props();

  const fullTitle = $derived(appendSiteName && !title.includes(SITE.name) ? `${title} | ${SITE.name}` : title);
  const canonical = $derived(absoluteUrl(path));
  const imageUrl = $derived(absoluteUrl(image));
  const nodes = $derived(includeSiteGraph ? [organizationNode(), periodicalNode(), websiteNode(), ...jsonLd] : jsonLd);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="author" content={SITE.fullName} />
  <meta name="publisher" content={SITE.fullName} />

  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:locale" content="en" />
  {#if publishedTime}<meta property="article:published_time" content={publishedTime} />{/if}
  {#if modifiedTime}<meta property="article:modified_time" content={modifiedTime} />{/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />

  <link rel="alternate" hreflang="en" href={canonical} />

  <script type="application/ld+json">{JSON.stringify(graph(nodes))}</script>
</svelte:head>
