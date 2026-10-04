import { Source, NewsItem } from '../types/research.types.js';

export function crossCheckNewsItems(newsItems: NewsItem[], officialSources: Source[]): NewsItem[] {
  return newsItems.map((item) => {
    // Look for matching official releases or documentation
    const keywords = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['react', 'vue', 'latest', 'release', 'update', 'announced', 'support'].includes(w));

    let matchingOfficial = officialSources.find((src) => {
      if (src.library.toLowerCase() !== item.library.toLowerCase()) return false;
      const srcText = (src.title + ' ' + src.snippet).toLowerCase();
      // If at least 2 distinct keywords or version numbers match
      const matches = keywords.filter((k) => srcText.includes(k));
      return matches.length >= 2 || (keywords.some((k) => /v?\d+\.\d+/.test(k)) && matches.length >= 1);
    });

    if (matchingOfficial) {
      return {
        ...item,
        isOfficiallyConfirmed: true,
        officialConfirmationSourceId: matchingOfficial.id,
        officialConfirmationUrl: matchingOfficial.url
      };
    }

    return {
      ...item,
      isOfficiallyConfirmed: false,
      officialConfirmationSourceId: null,
      officialConfirmationUrl: null
    };
  });
}
