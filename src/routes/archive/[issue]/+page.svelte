<script lang="ts">
  import { page } from '$app/state';
  import { archive } from '$lib/data/archive-index';
  import { sortIssues } from '$lib/data/archive';
  import { issuePath, paramId } from '$lib/data/paths';
  import Seo from '$lib/components/site/seo.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import IssueDetail from '$lib/components/archive/issue-detail.svelte';
  import { breadcrumbNode, publicationIssueNodes, scholarlyArticleNode } from '$lib/seo';

  /* params.issue is the raw URL segment, which carries the .html suffix. */
  const issueId = $derived(paramId(page.params.issue));
  const issue = $derived(archive.issues.find((item) => item.id === issueId));
  const ordered = $derived(sortIssues(archive.issues, -1));
  const position = $derived(issue ? ordered.findIndex((item) => item.id === issue.id) : -1);
  const newer = $derived(position > 0 ? ordered[position - 1] : null);
  const older = $derived(position >= 0 && position < ordered.length - 1 ? ordered[position + 1] : null);
</script>

{#if issue}
  <Seo
    title={issue.title}
    description={`${issue.title} — ${issue.articles.length} articles from the Global Journal of Management, Social Sciences and Humanities (GJMSSH), ${issue.volumeNumber ? `volume ${issue.volumeNumber}, ` : ''}${issue.issueNumber ? `issue ${issue.issueNumber}, ` : ''}published ${issue.year}. Full text PDFs available.`}
    path={issuePath(issue.id)}
    type="article"
    jsonLd={[
      breadcrumbNode([
        { name: 'Home', path: '/' },
        { name: 'Archive', path: '/archive.html' },
        { name: issue.title, path: issuePath(issue.id) }
      ]),
      ...publicationIssueNodes([issue]),
      ...issue.articles.map((article) => scholarlyArticleNode(article, issuePath(issue.id)))
    ]}
  />
  <IssueDetail {issue} {newer} {older} />
{:else}
  <Seo title="Issue not found" description="The requested issue is not part of the journal archive." path={issuePath(issueId)} />
  <section class="container-page py-20">
    <h1 class="display-1 font-bold">Issue not found</h1>
    <p class="mt-3 max-w-[60ch] text-muted-foreground">
      This issue id is not present in the journal's published archive index. Browse the archive to find the volume and
      issue you need.
    </p>
    <div class="mt-6"><Button href="/archive.html">Back to the archive</Button></div>
  </section>
{/if}
