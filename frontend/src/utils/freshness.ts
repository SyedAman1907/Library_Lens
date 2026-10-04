import { SourceType, FreshnessCategory, FreshnessInfo } from '../types';

// Configurable TTL rules in seconds by source type
export const SOURCE_TTL_CONFIG: Record<string, number> = {
  news: 3 * 86400,            // 3 days
  npm: 1 * 86400,             // 1 day
  pypi: 1 * 86400,            // 1 day
  crates: 1 * 86400,          // 1 day
  maven: 1 * 86400,           // 1 day
  nuget: 1 * 86400,           // 1 day
  official_release: 7 * 86400,// 7 days
  github: 7 * 86400,          // 7 days
  official_docs: 30 * 86400,  // 30 days
  web: 14 * 86400,            // 14 days
  community: 7 * 86400,       // 7 days
  image: 30 * 86400           // 30 days
};

export function formatTimeAgo(isoDateStr: string | null | undefined): string {
  if (!isoDateStr) return 'Active';
  try {
    const date = new Date(isoDateStr);
    if (isNaN(date.getTime())) return isoDateStr;

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 0) return 'Just now';
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    }
    if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffSeconds < 2592000) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (diffSeconds < 31536000) {
      const months = Math.floor(diffSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch {
    return isoDateStr;
  }
}

export function evaluateSourceFreshness(
  publishedAt: string | null,
  retrievedAt: string,
  sourceType: SourceType = 'web',
  lastVerifiedAt?: string
): FreshnessInfo {
  const retrievedText = formatTimeAgo(retrievedAt);
  const publishedText = publishedAt ? formatTimeAgo(publishedAt) : null;
  const verifiedDate = lastVerifiedAt || retrievedAt;

  const ttlSeconds = SOURCE_TTL_CONFIG[sourceType] || (14 * 86400);

  let ageDays: number | null = null;
  let category: FreshnessCategory = 'FRESH';
  let isStale = false;

  const retrievedTime = new Date(retrievedAt).getTime();
  const now = Date.now();
  const elapsedSecondsSinceRetrieval = Math.max(0, Math.floor((now - (isNaN(retrievedTime) ? now : retrievedTime)) / 1000));

  if (elapsedSecondsSinceRetrieval > ttlSeconds) {
    category = 'STALE';
    isStale = true;
  } else if (elapsedSecondsSinceRetrieval > ttlSeconds * 0.6) {
    category = 'AGING';
  } else {
    category = 'FRESH';
  }

  if (publishedAt) {
    try {
      const pubDate = new Date(publishedAt);
      if (!isNaN(pubDate.getTime())) {
        ageDays = Math.floor((now - pubDate.getTime()) / (1000 * 86400));
      }
    } catch {
      // Ignore
    }
  }

  return {
    category,
    retrievedText,
    publishedText,
    ageDays,
    ttlSeconds,
    isStale,
    lastResearchedAt: retrievedAt,
    lastVerifiedAt: verifiedDate
  };
}
