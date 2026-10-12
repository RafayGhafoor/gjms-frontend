<script lang="ts">
  import { page } from '$app/state';
  import { archive } from '$lib/data/archive-index';
  import { articlePath, paramId } from '$lib/data/paths';
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import ArticleDetail from '$lib/components/article/article-detail.svelte';
  import { breadcrumbNode, scholarlyArticleNode, publicationIssueNodes } from '$lib/seo';
  import { summariseForMeta } from '$lib/data/text';

  let { data } = $props();

  /* params.slug is the raw URL segment, which carries the .html suffix. */
  const slug = $derived(paramId(page.params.slug));
  const article = $derived(archive.articles.find((item) => item.slug === slug));
  const issue = $derived(article ? (archive.issues.find((item) => item.id === article.issueId) ?? null) : null);

  /* The abstract comes from the server load (abstracts.json stays server-side). */
  const abstract = $derived(data?.abstract ?? '');

  const description = $derived(
    abstract
      ? summariseForMeta(abstract)
      : `${article?.title ?? 'Article'} — open-access article published in the Global Journal of Management, Social Sciences and Humanities (GJMSSH).`
  );
</script>

{#if article}
  <Seo
    title={article.title}
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
    <h1 class="text-3xl font-extrabold tracking-tight">Article not found</h1>
    <p class="mt-3 max-w-[60ch] text-muted-foreground">
      This article id is not present in the journal's published archive index.
    </p>
    <div class="mt-6"><Button href="/archive.html">Browse the archive</Button></div>
  </section>
{/if}
