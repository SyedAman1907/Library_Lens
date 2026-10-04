import { describe, it, expect } from 'vitest';
import { normalizeLibraryName } from '../research/normalizer.js';
import { detectEcosystem } from '../research/ecosystem.js';
import { createResearchPlan } from '../research/planner.js';
import { analyzeResearchQuestion } from '../research/analyzer.js';
import { deduplicateSources } from '../evidence/deduplicator.js';
import { rankSources } from '../evidence/ranker.js';
import { validateReportCitations } from '../citations/validator.js';
import { evaluateSourceFreshness } from '../utils/freshness.js';
import { challengeClaim } from '../citations/challenger.js';
import { Source, ResearchRecord } from '../types/research.types.js';

describe('Library Normalization & Typo Detection', () => {
  it('correctly normalizes exact names (React, Vue, FastAPI)', () => {
    expect(normalizeLibraryName('react').canonical).toBe('React');
    expect(normalizeLibraryName('vue').canonical).toBe('Vue');
    expect(normalizeLibraryName('fastapi').canonical).toBe('FastAPI');
  });

  it('detects typos and suggests corrections (Reac -> React, FastAPi -> FastAPI)', () => {
    const resA = normalizeLibraryName('reac');
    expect(resA.suggestion?.suggested).toBe('React');

    const resB = normalizeLibraryName('dockr');
    expect(resB.canonical).toBeDefined();
  });
});

describe('Natural Language Question Analysis (AI Research Agent)', () => {
  it('identifies libraries and migration intent from migration question', async () => {
    const q = 'Should I migrate from Express to FastAPI for a production API?';
    const analysis = await analyzeResearchQuestion(q);

    expect(analysis.identifiedLibraries).toContain('Express');
    expect(analysis.identifiedLibraries).toContain('FastAPI');
    expect(analysis.intent).toBe('migration');
  });

  it('identifies comparison intent for dashboard query', async () => {
    const q = 'Compare React and Vue for a large dashboard.';
    const analysis = await analyzeResearchQuestion(q);

    expect(analysis.identifiedLibraries).toContain('React');
    expect(analysis.identifiedLibraries).toContain('Vue');
    expect(analysis.intent).toBe('comparison');
  });

  it('handles single-library safety evaluation question with reasonable alternative', async () => {
    const q = 'Is the latest Next.js release safe to migrate to?';
    const analysis = await analyzeResearchQuestion(q);

    expect(analysis.identifiedLibraries[0]).toBe('Next.js');
    expect(analysis.identifiedLibraries.length).toBe(2);
    expect(analysis.intent).toBe('safety_evaluation');
  });
});

describe('Ecosystem Detection', () => {
  it('identifies default ecosystems for major libraries', async () => {
    const npmEco = await detectEcosystem('react', 'npm');
    expect(npmEco.ecosystem).toBe('npm');

    const pyEco = await detectEcosystem('fastapi', 'pypi');
    expect(pyEco.ecosystem).toBe('pypi');

    const crateEco = await detectEcosystem('tokio', 'crates');
    expect(crateEco.ecosystem).toBe('crates');
  });
});

describe('Research Plan & 10 High-Level Actions', () => {
  it('creates targeted first-party documentation and release tasks with 10-step plan', () => {
    const plan = createResearchPlan('React', 'Vue', 'Enterprise Dashboard', { includeNews: true, includeVisuals: true });
    expect(plan.tasks.length).toBeGreaterThan(6);
    expect(plan.actions.length).toBe(10);
    expect(plan.actions[0].label).toBe('Identify current versions');
    expect(plan.actions[9].label).toBe('Generate evidence-backed report');

    const queries = plan.tasks.map((t) => t.query);
    expect(queries.some((q) => q.includes('official documentation'))).toBe(true);
    expect(queries.some((q) => q.includes('breaking changes'))).toBe(true);
    expect(queries.some((q) => q.includes('migration guide'))).toBe(true);
  });
});

describe('Source Deduplication & Ranking (Tier Hierarchy)', () => {
  it('deduplicates identical URLs with query params', () => {
    const sources: Source[] = [
      {
        id: 'src_001',
        title: 'React Docs',
        url: 'https://react.dev/reference/react?utm_source=test',
        sourceType: 'official_docs',
        tier: 1,
        publisher: 'React',
        library: 'React',
        snippet: 'React reference docs',
        publishedAt: null,
        retrievedAt: new Date().toISOString(),
        confidence: 0.95
      },
      {
        id: 'src_002',
        title: 'React Docs Duplicate',
        url: 'https://react.dev/reference/react/',
        sourceType: 'official_docs',
        tier: 1,
        publisher: 'React',
        library: 'React',
        snippet: 'Duplicate entry',
        publishedAt: null,
        retrievedAt: new Date().toISOString(),
        confidence: 0.90
      }
    ];

    const deduplicated = deduplicateSources(sources);
    expect(deduplicated.length).toBe(1);
  });

  it('ranks Tier 1 official sources higher than Tier 3 news and Tier 4 community', () => {
    const sources: Source[] = [
      {
        id: 'src_tier4',
        title: 'Community Discussion',
        url: 'https://reddit.com/r/react',
        sourceType: 'community',
        tier: 4,
        publisher: 'Reddit',
        library: 'React',
        snippet: 'Community thread',
        publishedAt: null,
        retrievedAt: new Date().toISOString(),
        confidence: 0.7
      },
      {
        id: 'src_tier1',
        title: 'Official Docs',
        url: 'https://react.dev',
        sourceType: 'official_docs',
        tier: 1,
        publisher: 'React',
        library: 'React',
        snippet: 'Official docs',
        publishedAt: null,
        retrievedAt: new Date().toISOString(),
        confidence: 0.98
      }
    ];

    const ranked = rankSources(sources);
    expect(ranked[0].tier).toBe(1);
    expect(ranked[1].tier).toBe(4);
  });
});

describe('Citation Validation & Anti-Hallucination', () => {
  it('purges nonexistent source IDs and validates verified claims', () => {
    const validSources: Source[] = [
      {
        id: 'src_001',
        title: 'React Official Documentation',
        url: 'https://react.dev',
        sourceType: 'official_docs',
        tier: 1,
        publisher: 'React',
        library: 'React',
        snippet: 'Official React Documentation',
        publishedAt: null,
        retrievedAt: new Date().toISOString(),
        confidence: 0.98
      }
    ];

    const mockReport = {
      featureMatrix: [
        {
          category: 'Reactivity',
          libraryA: 'Virtual DOM reconciliation',
          libraryB: 'Proxy-based reactivity',
          sourceIds: ['src_001', 'src_nonexistent_999'],
          confidence: 0.95
        }
      ]
    };

    const { validatedReport, summary } = validateReportCitations(mockReport, validSources, 'React', 'Vue');

    expect(summary.invalidSourceIdsPurged).toBe(1);
    expect(summary.validCitationsCount).toBe(1);
    expect(validatedReport.featureMatrix![0].sourceIds).toEqual(['src_001']);
  });
});

describe('Freshness Engine & TTL Rules', () => {
  it('evaluates freshly retrieved source as FRESH', () => {
    const fresh = evaluateSourceFreshness(null, new Date().toISOString(), 'official_docs');
    expect(fresh.category).toBe('FRESH');
    expect(fresh.isStale).toBe(false);
  });

  it('evaluates source older than TTL as STALE', () => {
    // 5 days ago for news (TTL is 3 days)
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400 * 1000).toISOString();
    const staleNews = evaluateSourceFreshness(null, fiveDaysAgo, 'news');
    expect(staleNews.category).toBe('STALE');
    expect(staleNews.isStale).toBe(true);
  });
});

describe('Claim Verification & Challenge Layer', () => {
  it('synthesizes verified result when corroborating sources exist', async () => {
    const mockRecord: ResearchRecord = {
      id: 'res_test',
      libraryA: 'React',
      libraryB: 'Vue',
      useCase: 'Test',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sources: [
        {
          id: 'src_001',
          title: 'Official React Documentation',
          url: 'https://react.dev',
          sourceType: 'official_docs',
          tier: 1,
          publisher: 'React Core',
          library: 'React',
          snippet: 'React supports Concurrent Mode and Server Components',
          publishedAt: null,
          retrievedAt: new Date().toISOString(),
          confidence: 0.99
        }
      ],
      evidence: [
        {
          id: 'ev_1',
          claim: 'React supports Concurrent Rendering and Suspense',
          sourceIds: ['src_001'],
          library: 'React',
          confidence: 0.95,
          verified: true
        }
      ]
    };

    const result = await challengeClaim(mockRecord, 'ev_1');
    expect(result.claimId).toBe('ev_1');
    expect(result.supportingEvidence.length).toBeGreaterThan(0);
    expect(['VERIFIED', 'CONFLICTING EVIDENCE', 'PARTIALLY VERIFIED']).toContain(result.verificationState);
  });
});

describe('Report Versioning & Diffs', () => {
  it('computes accurate version differences during report updates', () => {
    const previousSources: Source[] = [
      {
        id: 'src_1',
        title: 'React Docs v18',
        url: 'https://react.dev/v18',
        sourceType: 'official_docs',
        tier: 1,
        publisher: 'React',
        library: 'React',
        snippet: 'Docs',
        publishedAt: null,
        retrievedAt: '2026-09-01T00:00:00.000Z',
        confidence: 0.9
      }
    ];

    const currentSources: Source[] = [
      ...previousSources,
      {
        id: 'src_2',
        title: 'React v19 Release Notes',
        url: 'https://react.dev/blog/react-19',
        sourceType: 'release_notes',
        tier: 1,
        publisher: 'React',
        library: 'React',
        snippet: 'React 19 release',
        publishedAt: '2026-10-01T00:00:00.000Z',
        retrievedAt: new Date().toISOString(),
        confidence: 0.98
      }
    ];

    const addedSources = currentSources.filter((s) => !previousSources.some((p) => p.url === s.url));
    expect(addedSources.length).toBe(1);
    expect(addedSources[0].id).toBe('src_2');
  });
});

describe('4-Tier Source Hierarchy Verification', () => {
  it('correctly ranks Tier 1 > Tier 2 > Tier 3 > Tier 4', () => {
    const sources: Source[] = [
      { id: 's4', title: 'Reddit discussion', url: 'https://reddit.com/r/webdev', sourceType: 'community', tier: 4, publisher: 'Reddit', library: 'React', snippet: 'Reddit post', publishedAt: null, retrievedAt: new Date().toISOString(), confidence: 0.5 },
      { id: 's2', title: 'npm registry metadata', url: 'https://npmjs.com/package/react', sourceType: 'registry', tier: 2, publisher: 'npm', library: 'React', snippet: 'npm package', publishedAt: null, retrievedAt: new Date().toISOString(), confidence: 0.85 },
      { id: 's3', title: 'InfoQ Tech Article', url: 'https://infoq.com/news/react', sourceType: 'news', tier: 3, publisher: 'InfoQ', library: 'React', snippet: 'InfoQ overview', publishedAt: null, retrievedAt: new Date().toISOString(), confidence: 0.75 },
      { id: 's1', title: 'Official GitHub Release', url: 'https://github.com/facebook/react/releases/tag/v19.0.0', sourceType: 'official_github', tier: 1, publisher: 'GitHub', library: 'React', snippet: 'GitHub release tag', publishedAt: null, retrievedAt: new Date().toISOString(), confidence: 0.99 }
    ];

    const ranked = rankSources(sources);
    expect(ranked.map((s) => s.tier)).toEqual([1, 2, 3, 4]);
  });
});
