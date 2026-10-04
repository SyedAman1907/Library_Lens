import { Source, SourceTier, SourceType } from '../types/research.types.js';

export function classifySourceTier(url: string, sourceType: SourceType, publisher: string): { tier: SourceTier; type: SourceType } {
  const lowerUrl = url.toLowerCase();
  const lowerPub = publisher.toLowerCase();

  // Tier 1: Official docs, GitHub repository, official release notes
  if (
    sourceType === 'official_docs' ||
    sourceType === 'official_release' ||
    lowerUrl.includes('.dev') ||
    lowerUrl.includes('docs.') ||
    lowerUrl.includes('/docs') ||
    lowerUrl.includes('/documentation') ||
    lowerUrl.includes('github.com')
  ) {
    if (lowerUrl.includes('github.com')) {
      return { tier: 1, type: sourceType === 'official_release' ? 'official_release' : 'github' };
    }
    return { tier: 1, type: 'official_docs' };
  }

  // Tier 2: Official package registries & Official project announcements
  if (
    sourceType === 'npm' ||
    sourceType === 'pypi' ||
    sourceType === 'crates' ||
    sourceType === 'maven' ||
    lowerUrl.includes('npmjs.com') ||
    lowerUrl.includes('pypi.org') ||
    lowerUrl.includes('crates.io') ||
    lowerUrl.includes('maven.org') ||
    lowerUrl.includes('nuget.org')
  ) {
    const pType: SourceType = lowerUrl.includes('pypi.org')
      ? 'pypi'
      : lowerUrl.includes('crates.io')
      ? 'crates'
      : lowerUrl.includes('maven.org')
      ? 'maven'
      : 'npm';
    return { tier: 2, type: pType };
  }

  if (
    (lowerUrl.includes('/blog') || lowerUrl.includes('/announcements')) &&
    (lowerPub.includes('official') || lowerPub.includes('foundation') || lowerPub.includes('team') || lowerUrl.includes('github.blog'))
  ) {
    return { tier: 2, type: 'web' };
  }

  // Tier 3: Reputable technical publications & News
  if (
    sourceType === 'news' ||
    lowerPub.includes('infoq') ||
    lowerPub.includes('the new stack') ||
    lowerPub.includes('techcrunch') ||
    lowerPub.includes('zdnet') ||
    lowerPub.includes('sd times') ||
    lowerPub.includes('devclass') ||
    lowerPub.includes('lwn') ||
    lowerPub.includes('reuters') ||
    lowerPub.includes('venturebeat')
  ) {
    return { tier: 3, type: 'news' };
  }

  // Tier 4: Community articles, forums, discussions, general web
  return { tier: 4, type: 'community' };
}

export function rankSources(sources: Source[]): Source[] {
  return [...sources].sort((a, b) => {
    // 1. Sort by tier ascending (Tier 1 is best)
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    // 2. Sort by confidence descending
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    // 3. Sort by recency (published date or retrieval)
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });
}
