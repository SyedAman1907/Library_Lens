import React, { useState } from 'react';
import { ResearchRecord, Source } from '../types';
import { BookOpen, ExternalLink, Calendar, ShieldCheck, ArrowRight, Filter, Search, Globe, GitBranch, Package, Newspaper } from 'lucide-react';
import { evaluateSourceFreshness, formatTimeAgo } from '../utils/freshness';

interface SourcesViewProps {
  research: ResearchRecord | null;
  onSelectSource: (source: Source) => void;
  onNewResearch: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  research,
  onSelectSource,
  onNewResearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Sources' },
    { id: 'official', label: 'Official Documentation' },
    { id: 'github', label: 'GitHub' },
    { id: 'package_registry', label: 'Package Registry' },
    { id: 'release_notes', label: 'Release Notes' },
    { id: 'news', label: 'News' },
    { id: 'community', label: 'Community' },
  ];

  // If active research exists, show actual empirical sources
  if (research && research.sources && research.sources.length > 0) {
    const filteredSources = research.sources.filter((s) => {
      const matchCat =
        selectedCategory === 'all' ||
        s.sourceType.toLowerCase().includes(selectedCategory.replace('_', '')) ||
        (selectedCategory === 'official' && s.sourceType === 'official_docs') ||
        (selectedCategory === 'release_notes' && s.sourceType.includes('release')) ||
        (selectedCategory === 'package_registry' &&
          (s.sourceType === 'npm' || s.sourceType === 'pypi' || s.sourceType === 'crates' || s.sourceType === 'maven'));

      const matchQuery =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.url.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-bold">
                {research.libraryA} vs {research.libraryB}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-[#F5F5F5] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <span>Source Center & Verification Registry</span>
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Empirical technical documentation, releases, and registries backing every fact
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sources..."
                className="w-full pl-9 pr-3 py-1.5 command-input text-xs bg-[#050505] text-[#F5F5F5]"
              />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold'
                  : 'text-[#71717A] hover:text-[#F5F5F5] bg-white/[0.03]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => {
            return (
              <div
                key={source.id}
                onClick={() => onSelectSource(source)}
                className="workspace-card p-5 flex flex-col justify-between hover:border-[#6D4AFF]/40 cursor-pointer transition-all group bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        source.tier === 1
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : source.tier === 2
                          ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                          : 'bg-white/[0.06] text-[#A1A1AA] border border-white/[0.08]'
                      }`}
                    >
                      Tier {source.tier} • {source.sourceType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-[#71717A]">
                      [{source.id}]
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-[#F5F5F5] line-clamp-2 group-hover:text-brand-300 transition-colors mb-2">
                    {source.title}
                  </h3>

                  <p className="text-xs text-[#A1A1AA] line-clamp-3 mb-4 leading-relaxed">
                    {source.snippet || 'Authoritative source reference retrieved during live research.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                    <span className="truncate max-w-[130px] font-semibold text-[#A1A1AA]">
                      {source.publisher}
                    </span>
                    <span>
                      {source.publishedAt ? formatTimeAgo(source.publishedAt) : 'Verified recent'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-[#71717A]">
                      Retrieved {formatTimeAgo(source.retrievedAt)}
                    </span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      <span>Open source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSources.length === 0 && (
          <div className="workspace-card p-12 text-center text-[#71717A] text-xs font-mono bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08]">
            No sources found matching your selected category or query.
          </div>
        )}
      </div>
    );
  }

  // When no active research report is in context, display empirical architecture
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#111114] dark:text-[#F5F5F5] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6D4AFF]" />
            <span>Authoritative Source Center</span>
          </h2>
          <p className="text-xs text-[#52525B] dark:text-[#71717A] mt-0.5">
            Every factual statement in LibraryLens AI is backed by empirical data layers
          </p>
        </div>

        <button
          onClick={onNewResearch}
          className="btn-primary"
        >
          <span>Start Research</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="workspace-card p-5 space-y-3 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
            Official Documentation
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Crawls verified official domains, getting-started guides, architecture references, and API definitions via SerpApi.
          </p>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">
            WEIGHT: PRIMARY EMPIRICAL (TIER 1)
          </span>
        </div>

        <div className="workspace-card p-5 space-y-3 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-[#52525B] dark:text-[#A1A1AA] flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
            GitHub Releases & Commits
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Inspects release tags, changelogs, breaking change notices, and commit activity from official GitHub repositories.
          </p>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">
            WEIGHT: PRIMARY EMPIRICAL (TIER 1)
          </span>
        </div>

        <div className="workspace-card p-5 space-y-3 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
            Package Registries
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Directly extracts current semver versions, release dates, licenses, unpacked sizes, and dependencies from npm, PyPI, crates.io, Maven, NuGet.
          </p>
          <span className="text-[10px] font-mono text-[#6D4AFF] dark:text-brand-400 font-bold block pt-1">
            WEIGHT: VERIFIED REGISTRY (TIER 2)
          </span>
        </div>

        <div className="workspace-card p-5 space-y-3 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
            Recent News & Developments
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Scans tech journalism, major version unveilings, and security advisories via Google News SerpApi engine.
          </p>
          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold block pt-1">
            WEIGHT: SECONDARY / NEWS (TIER 3)
          </span>
        </div>

        <div className="workspace-card p-5 space-y-3 md:col-span-2 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
              Strict Citation Verification Engine
            </h3>
          </div>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            LibraryLens AI enforces a zero-hallucination constraint: claims must link to a citation index badge <code className="text-[#6D4AFF] dark:text-brand-400 font-semibold">[1]</code> that maps directly to a verified source URL. If no source can corroborate a feature or claim, it is excluded.
          </p>
          <button
            onClick={onNewResearch}
            className="pt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D4AFF] dark:text-brand-400 hover:underline cursor-pointer"
          >
            <span>Run a comparison now to inspect live source tracking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
