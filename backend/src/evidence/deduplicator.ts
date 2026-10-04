import { Source } from '../types/research.types.js';

export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Strip common tracking parameters
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.searchParams.delete('utm_term');
    parsed.searchParams.delete('utm_content');
    parsed.searchParams.delete('ref');
    parsed.searchParams.delete('fbclid');
    parsed.searchParams.delete('gclid');

    // Strip trailing slash
    let clean = parsed.origin + parsed.pathname.replace(/\/+$/, '') + (parsed.search ? parsed.search : '');
    return clean;
  } catch {
    return rawUrl.trim().replace(/\/+$/, '');
  }
}

export function deduplicateSources(sources: Source[]): Source[] {
  const seenUrls = new Map<string, Source>();

  for (const src of sources) {
    if (!src.url) continue;
    const cleanUrl = normalizeUrl(src.url);

    if (seenUrls.has(cleanUrl)) {
      const existing = seenUrls.get(cleanUrl)!;
      // Keep higher confidence or tier
      if (src.tier < existing.tier || (src.tier === existing.tier && src.confidence > existing.confidence)) {
        seenUrls.set(cleanUrl, {
          ...src,
          id: existing.id // Preserve consistent ID
        });
      }
    } else {
      seenUrls.set(cleanUrl, src);
    }
  }

  return Array.from(seenUrls.values());
}
