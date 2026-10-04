import { Source, ReleaseInfo, NewsItem, VisualReference } from '../types/research.types.js';
import { mcpClient } from '../mcp/client.js';
import { fetchPackageRegistryData } from '../mcp/tools/package_registry.tool.js';
import { fetchGitHubResearch } from '../mcp/tools/github_research.tool.js';
import { classifySourceTier, rankSources } from './ranker.js';
import { deduplicateSources } from './deduplicator.js';
import { crossCheckNewsItems } from './cross_checker.js';
import { ResearchPlan } from '../research/planner.js';
import { logger } from '../utils/logger.js';

export interface EvidenceCollectionResult {
  sources: Source[];
  releases: ReleaseInfo[];
  news: NewsItem[];
  visuals: VisualReference[];
  versionDataA: any;
  versionDataB: any;
  stats: {
    searchesPerformed: string[];
    toolsUsed: string[];
    totalExamined: number;
    officialCount: number;
    newsCount: number;
    visualsCount: number;
  };
}

export type ProgressCallback = (step: string, message: string, percent: number) => void;

export async function collectEvidence(
  plan: ResearchPlan,
  ecosystemA: { ecosystem: string; packageName: string },
  ecosystemB: { ecosystem: string; packageName: string },
  onProgress?: ProgressCallback
): Promise<EvidenceCollectionResult> {
  const rawSources: Source[] = [];
  const releases: ReleaseInfo[] = [];
  const rawNews: NewsItem[] = [];
  const visuals: VisualReference[] = [];
  const searchesPerformed: string[] = [];
  const toolsUsed = new Set<string>();

  const reportProgress = (step: string, msg: string, pct: number) => {
    logger.info(`[Progress ${pct}%] ${step}: ${msg}`);
    if (onProgress) onProgress(step, msg, pct);
  };

  // Step 1: Package Registry Research (Tier 2 Primary Package Data)
  reportProgress('package_registry', `Querying official package registries for ${plan.libraryA} and ${plan.libraryB}...`, 10);
  toolsUsed.add('package_metadata');
  toolsUsed.add('version_lookup');

  const [pkgA, pkgB] = await Promise.all([
    fetchPackageRegistryData(plan.libraryA, ecosystemA.ecosystem, ecosystemA.packageName),
    fetchPackageRegistryData(plan.libraryB, ecosystemB.ecosystem, ecosystemB.packageName)
  ]);

  if (pkgA.source) rawSources.push(pkgA.source);
  if (pkgB.source) rawSources.push(pkgB.source);

  // Step 2: GitHub Repository & Release Research (Tier 1 Primary Evidence)
  reportProgress('github_research', `Researching GitHub repositories, changelogs, and release tags...`, 25);
  toolsUsed.add('github_release_search');

  const [ghA, ghB] = await Promise.all([
    fetchGitHubResearch(plan.libraryA, pkgA.versionData.repoUrl),
    fetchGitHubResearch(plan.libraryB, pkgB.versionData.repoUrl)
  ]);

  rawSources.push(...ghA.sources);
  releases.push(...ghA.releases);

  rawSources.push(...ghB.sources);
  releases.push(...ghB.releases);

  // Step 3: MCP SerpApi Live Web & Documentation Research
  reportProgress('web_research', `Executing live web & documentation research via SerpApi tools...`, 45);
  toolsUsed.add('web_search');
  toolsUsed.add('documentation_search');

  // Run targeted tasks from the research plan
  for (const task of plan.tasks) {
    searchesPerformed.push(task.query);

    if (task.type === 'doc_search' || task.type === 'release_search' || task.type === 'breaking_changes' || task.type === 'migration') {
      try {
        const searchRes = await mcpClient.documentationSearch(task.query);
        if (searchRes.results && searchRes.results.length > 0) {
          for (const item of searchRes.results) {
            const { tier, type } = classifySourceTier(item.url, item.sourceType || 'web', item.source || '');
            rawSources.push({
              id: '', // Will be assigned sequentially
              title: item.title,
              url: item.url,
              sourceType: type,
              tier,
              publisher: item.source || 'Web Documentation',
              library: task.library,
              snippet: item.snippet,
              publishedAt: item.publishedAt || null,
              retrievedAt: item.retrievedAt || new Date().toISOString(),
              confidence: tier === 1 ? 0.96 : tier === 2 ? 0.92 : 0.82
            });
          }
        }
      } catch (err: any) {
        logger.warn(`Search error for task ${task.query}: ${err.message}`);
      }
    } else if (task.type === 'news' && plan.includeNews) {
      reportProgress('news_research', `Scanning current news and announcements for ${task.library}...`, 60);
      toolsUsed.add('news_search');
      try {
        const newsRes = await mcpClient.newsSearch(task.query);
        if (newsRes.results && newsRes.results.length > 0) {
          for (const item of newsRes.results) {
            rawNews.push({
              id: `news_${task.library.toLowerCase()}_${rawNews.length + 1}`,
              title: item.title,
              publisher: item.source || 'Tech News',
              publishedAt: item.publishedAt || null,
              retrievedAt: item.retrievedAt || new Date().toISOString(),
              snippet: item.snippet,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
              library: task.library,
              isOfficiallyConfirmed: false
            });

            // Also register news item as Tier 4 source
            rawSources.push({
              id: '',
              title: item.title,
              url: item.url,
              sourceType: 'news',
              tier: 4,
              publisher: item.source || 'Tech News',
              library: task.library,
              snippet: item.snippet,
              publishedAt: item.publishedAt,
              retrievedAt: item.retrievedAt,
              confidence: 0.80
            });
          }
        }
      } catch (err: any) {
        logger.warn(`News search failed for ${task.query}: ${err.message}`);
      }
    } else if (task.type === 'visuals' && plan.includeVisuals) {
      reportProgress('visual_research', `Discovering visual references for ${task.library}...`, 70);
      toolsUsed.add('images_search');
      try {
        const imgRes = await mcpClient.imagesSearch(task.query);
        if (imgRes.results && imgRes.results.length > 0) {
          for (const item of imgRes.results.slice(0, 4)) {
            visuals.push({
              title: item.title,
              imageUrl: item.imageUrl,
              thumbnailUrl: item.thumbnailUrl,
              sourceUrl: item.sourceUrl,
              sourceTitle: item.sourceTitle,
              sourceDomain: item.sourceDomain,
              rightsNotice: item.rightsNotice
            });
          }
        }
      } catch (err: any) {
        logger.warn(`Images search failed for ${task.query}: ${err.message}`);
      }
    }
  }

  // Step 4: Source Deduplication & Canonical Normalization
  reportProgress('deduplication', `Deduplicating and quality-ranking sources...`, 80);
  const deduplicated = deduplicateSources(rawSources);
  const ranked = rankSources(deduplicated);

  // Assign clean sequential IDs: src_001, src_002, etc.
  const indexedSources: Source[] = ranked.map((s, idx) => ({
    ...s,
    id: `src_${String(idx + 1).padStart(3, '0')}`
  }));

  // Step 5: Cross-check news items against official sources
  const confirmedNews = crossCheckNewsItems(
    rawNews,
    indexedSources.filter((s) => s.tier === 1)
  );

  const officialCount = indexedSources.filter((s) => s.tier === 1).length;
  const newsCount = confirmedNews.length;
  const visualsCount = visuals.length;

  reportProgress('evidence_ready', `Collected ${indexedSources.length} verified sources (${officialCount} Tier 1 official).`, 88);

  return {
    sources: indexedSources,
    releases,
    news: confirmedNews,
    visuals,
    versionDataA: pkgA.versionData,
    versionDataB: pkgB.versionData,
    stats: {
      searchesPerformed,
      toolsUsed: Array.from(toolsUsed),
      totalExamined: rawSources.length,
      officialCount,
      newsCount,
      visualsCount
    }
  };
}
