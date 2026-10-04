import axios from 'axios';
import { logger } from '../../utils/logger.js';
import { Source, ReleaseInfo } from '../../types/research.types.js';

export interface GitHubResearchOutput {
  repoUrl: string;
  stars?: number;
  openIssues?: number;
  releases: ReleaseInfo[];
  sources: Source[];
}

function parseGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
  return null;
}

export async function fetchGitHubResearch(
  library: string,
  hintRepoUrl?: string
): Promise<GitHubResearchOutput> {
  const retrievedAt = new Date().toISOString();
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LibraryLensAI-Research/1.0'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  let ownerRepo = hintRepoUrl ? parseGitHubOwnerRepo(hintRepoUrl) : null;

  // If no repo URL, attempt a quick GitHub search
  if (!ownerRepo) {
    try {
      const searchRes = await axios.get(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(library)}&sort=stars&order=desc&per_page=1`,
        { headers, timeout: 4000 }
      );
      if (searchRes.data?.items?.length > 0) {
        const topItem = searchRes.data.items[0];
        ownerRepo = { owner: topItem.owner.login, repo: topItem.name };
      }
    } catch (err: any) {
      logger.warn(`GitHub repository search skipped for ${library}: ${err.message}`);
    }
  }

  if (!ownerRepo) {
    return { repoUrl: '', releases: [], sources: [] };
  }

  const { owner, repo } = ownerRepo;
  const canonicalRepoUrl = `https://github.com/${owner}/${repo}`;
  const sources: Source[] = [];
  const releases: ReleaseInfo[] = [];

  let stars: number | undefined;
  let openIssues: number | undefined;

  // 1. Fetch repository stats
  try {
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      timeout: 4000
    });
    if (repoRes.status === 200 && repoRes.data) {
      stars = repoRes.data.stargazers_count;
      openIssues = repoRes.data.open_issues_count;

      const repoSourceId = `src_gh_repo_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      sources.push({
        id: repoSourceId,
        title: `${library} Official GitHub Repository (${owner}/${repo})`,
        url: canonicalRepoUrl,
        sourceType: 'github',
        tier: 1,
        publisher: 'GitHub',
        library,
        claim: `${library} official source repository is hosted on GitHub at ${owner}/${repo} with ${stars ? stars.toLocaleString() : 'active'} stars.`,
        snippet: `${repoRes.data.description || library}. Stars: ${stars?.toLocaleString() || 'N/A'}. Open issues: ${openIssues?.toLocaleString() || 'N/A'}. Default branch: ${repoRes.data.default_branch}`,
        publishedAt: repoRes.data.updated_at,
        retrievedAt,
        confidence: 0.99
      });
    }
  } catch (err: any) {
    logger.warn(`GitHub repo details fetch failed for ${owner}/${repo}: ${err.message}`);
  }

  // 2. Fetch releases
  try {
    const relRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`, {
      headers,
      timeout: 4000
    });

    if (relRes.status === 200 && Array.isArray(relRes.data) && relRes.data.length > 0) {
      for (const item of relRes.data) {
        const tagName = item.tag_name || item.name || '';
        const releaseUrl = item.html_url || canonicalRepoUrl;
        const pubDate = item.published_at || item.created_at || null;
        const sourceId = `src_gh_rel_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${tagName.replace(/[^a-zA-Z0-9]/g, '')}`;
        const summary = (item.body || '').slice(0, 300).replace(/\r?\n/g, ' ');

        sources.push({
          id: sourceId,
          title: `${library} GitHub Release ${tagName}`,
          url: releaseUrl,
          sourceType: 'official_release',
          tier: 1,
          publisher: 'GitHub Releases',
          library,
          claim: `${library} released version ${tagName} on ${pubDate ? pubDate.split('T')[0] : 'recent date'}.`,
          snippet: summary || `Release ${tagName} published on GitHub.`,
          publishedAt: pubDate,
          retrievedAt,
          confidence: 0.98
        });

        releases.push({
          library,
          version: tagName,
          releaseDate: pubDate,
          changelogUrl: releaseUrl,
          sourceId,
          summary,
          isPrerelease: Boolean(item.prerelease)
        });
      }
    } else {
      // Fallback to tags if releases array is empty
      const tagsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=3`, {
        headers,
        timeout: 3000
      });
      if (tagsRes.status === 200 && Array.isArray(tagsRes.data)) {
        for (const tag of tagsRes.data) {
          const tagName = tag.name;
          const tagUrl = `${canonicalRepoUrl}/releases/tag/${encodeURIComponent(tagName)}`;
          const sourceId = `src_gh_tag_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${tagName.replace(/[^a-zA-Z0-9]/g, '')}`;

          sources.push({
            id: sourceId,
            title: `${library} Release Tag ${tagName}`,
            url: tagUrl,
            sourceType: 'github',
            tier: 1,
            publisher: 'GitHub',
            library,
            claim: `${library} tagged version ${tagName}.`,
            snippet: `Git tag ${tagName} on ${canonicalRepoUrl}`,
            publishedAt: null,
            retrievedAt,
            confidence: 0.95
          });

          releases.push({
            library,
            version: tagName,
            releaseDate: null,
            changelogUrl: tagUrl,
            sourceId,
            isPrerelease: false
          });
        }
      }
    }
  } catch (err: any) {
    logger.warn(`GitHub releases fetch failed for ${owner}/${repo}: ${err.message}`);
  }

  return {
    repoUrl: canonicalRepoUrl,
    stars,
    openIssues,
    releases,
    sources
  };
}
