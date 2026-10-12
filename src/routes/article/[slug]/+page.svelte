<script lang="ts">
  import { articlePath } from '$lib/data/paths';
  import { SITE } from '$lib/config/site';
  import type { PageProps } from './$types';
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleDetail from '$lib/components/article/article-detail.svelte';
  import { breadcrumbNode, scholarlyArticleNode, publicationIssueNodes } from '$lib/seo';
  import { summariseForMeta } from '$lib/data/text';
  import { collectCitationMeta } from '$lib/data/citation';

  let { data }: PageProps = $props();

  /* Resolved in the server load at build time: the archive index is ~30 KB
     gzipped and this page needs exactly one record plus its issue. */
  const article = $derived(data.article);
  const issue = $derived(data.issue);
  const slug = $derived(data.slug);
  const abstract = $derived(article?.abstract ?? '');

  /* Highwire Press metadata — what Google Scholar reads to index an article
     landing page. Only fields that exist in the journal's records are emitted
     (there is no ISSN, DOI or keyword data to publish). */
  const citationMeta = $derived.by(() => {
    const entries: { name: string; content: string }[] = [];
    if (!article) return entries;
    collectCitationMeta(article, abstract, entries);
    return entries;
  });

  const description = $derived(
    abstract
      ? summariseForMeta(abstract)
      : `${article?.title ?? 'Article'} — open-access article published in the Global Journal of Management, Social Sciences and Humanities (GJMSSH).`
  );

  /* A handful of records share a title across issues (the "Author's Guideline"
     front-matter entries). Appending the issue keeps their SEO titles unique
     without altering the published title shown on the page. */
  const seoTitle = $derived.by(() => {
    if (!article) return 'Article';
    return data.titleIsShared && issue ? `${article.title} — ${issue.title}` : article.title;
  });
</script>

{#if article}
  <Seo
    title={seoTitle}
    {description}
    path={articlePath(article.slug)}
    type="article"
    jsonLd={[
      breadcrumbNode([
        { name: 'Home', path: '/' },
        { name: 'Archive', path: '/archive.html' },
        ...(issue ? [{ name: issue.title, path: `/archive/${issue.id}.html` }] : []),
        { name: article.title, path: articlePath(article.slug) }
      ]),
      ...(issue ? publicationIssueNodes([issue]) : []),
      scholarlyArticleNode({ ...article, abstract })
    ]}
  />
  <ArticleDetail {article} {issue} {abstract} />


{:else}
  <Seo
    title="Article not found"
    description="The requested article is not part of the journal archive."
    path={articlePath(slug)}
  />
  <section class="container-page py-20">
    <h1 class="display-1 font-bold">Article not found</h1>
    <p class="mt-3 max-w-[60ch] text-muted-foreground">
      This article id is not present in the journal's published archive index.
    </p>
    <div class="mt-6"><Button href="/archive.html">Browse the archive</Button></div>
  </section>
{/if}

<svelte:head>
  {#each citationMeta as meta (`${meta.name}:${meta.content}`)}
    <meta name={meta.name} content={meta.content} />
  {/each}
</svelte:head>
