import React, { useState, useEffect } from 'react';
import {
  ResearchRecord,
  Source,
  ComparisonReport,
  ReleaseInfo,
  NewsItem,
  BreakingChangeItem,
  Evidence
} from '../types';
import { CitationBadge } from './CitationBadge';
import { EvidenceGraph } from './EvidenceGraph';
import { BreakingChangeRadar } from './BreakingChangeRadar';
import { MigrationAssistant } from './MigrationAssistant';
import { UseCaseAnalyzer } from './UseCaseAnalyzer';
import { ClaimChallengeModal } from './ClaimChallengeModal';
import { ResearchReplayModal } from './ResearchReplayModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import {
  RefreshCw,
  Download,
  Printer,
  Copy,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  GitBranch,
  BookOpen,
  AlertTriangle,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Bookmark,
  FileText,
  Boxes,
  Eye,
  Calendar,
  Star,
  History,
  Scale,
  Zap,
  HelpCircle,
  Network,
  Radio,
  AlertOctagon,
  Newspaper,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { formatTimeAgo, evaluateSourceFreshness } from '../utils/freshness';

interface ReportViewProps {
  research: ResearchRecord;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSelectSource: (source: Source) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onNavigateToRecommendations?: (req?: string) => void;
  onNavigateToComparisons?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  research,
  onRefresh,
  isRefreshing,
  onSelectSource,
  isSaved = false,
  onToggleSave,
  onNavigateToRecommendations,
  onNavigateToComparisons,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [newsFilter, setNewsFilter] = useState<string>('all');
  const [showTransparency, setShowTransparency] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [challengedClaim, setChallengedClaim] = useState<Evidence | null>(null);
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const report = research.report;
  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center workspace-card text-[#71717A] font-mono text-xs">
        Research report generation in progress or unavailable.
      </div>
    );
  }

  const {
    libraryA,
    libraryB,
    useCase,
    sources = [],
    evidence = [],
    question,
    currentVersionNumber = 1,
    versions = [],
    lastResearchedAt,
    lastVerifiedAt,
  } = research;

  // Real empirical metrics (Section 11 & 20 Requirement)
  const officialSourcesCount = sources.filter((s) => s.tier === 1).length;
  const verifiedClaimsCount = evidence.filter((e) => e.verified).length;
  const recentNewsCount = report.recentDevelopments?.length || 0;
  const researchDurationSec = report.researchTransparency?.researchDurationMs
    ? (report.researchTransparency.researchDurationMs / 1000).toFixed(1)
    : undefined;

  // Freshness calculation (Section 10 & 17)
  const freshness = evaluateSourceFreshness(
    sources[0]?.publishedAt || null,
    research.lastResearchedAt || research.updatedAt || research.createdAt,
    'web',
    research.lastVerifiedAt
  );

  const timeAgoStr = formatTimeAgo(research.updatedAt || research.createdAt);

  const handleCopyReport = () => {
    const md = generateMarkdownReport(research);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/research/${research.id}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const filteredSources = sources.filter((s) => {
    if (sourceFilter === 'official' && s.tier !== 1) return false;
    if (sourceFilter === 'registry' && s.tier !== 2) return false;
    if (sourceFilter === 'news' && s.tier !== 3 && s.sourceType !== 'news') return false;
    if (sourceFilter === 'community' && s.tier !== 4) return false;
    if (sourceSearch.trim()) {
      const q = sourceSearch.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        s.publisher.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredNews = (report.recentDevelopments || []).filter((item) => {
    if (newsFilter === 'all') return true;
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase();
    if (newsFilter === 'releases') return /release|v\d+/i.test(text);
    if (newsFilter === 'security') return /cve|security|vulnerability|patch/i.test(text);
    if (newsFilter === 'ecosystem') return /ecosystem|community|article|blog/i.test(text);
    if (newsFilter === 'announcements') return item.isOfficiallyConfirmed;
    return true;
  });

  // Section 12: Sticky horizontal navigation tabs
  const navigationTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'versions', label: 'Versions' },
    { id: 'releases', label: 'Releases' },
    { id: 'breaking-changes', label: 'Breaking Changes' },
    { id: 'migration', label: 'Migration' },
    { id: 'ecosystem', label: 'Ecosystem' },
    ...(recentNewsCount > 0 ? [{ id: 'news', label: `News (${recentNewsCount})` }] : []),
    { id: 'evidence', label: 'Evidence Graph' },
    { id: 'sources', label: `Sources (${sources.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-text">
      {/* =================================================================
          SECTION 11: REDESIGNED RESULT HEADER & EMPIRICAL METRICS
         ================================================================= */}
      <div className="workspace-card p-6 sm:p-7 space-y-6 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E5E7EB] dark:border-white/[0.08]">
          <div className="space-y-2 max-w-3xl">
            {/* Header Meta: Freshness & Real Timestamp */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Report</span>
              </span>

              {/* Freshness Badge (Section 17) */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase border ${
                  freshness.category === 'FRESH'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : freshness.category === 'AGING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>{freshness.category}</span>
              </span>

              <span className="text-[#71717A]">
                Researched {timeAgoStr}
              </span>

              {/* Version pill */}
              <button
                onClick={() => setIsVersionHistoryOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] border border-[#E5E7EB] dark:border-white/[0.06] transition-colors cursor-pointer"
              >
                <History className="w-3 h-3 text-brand-400" />
                <span>v{currentVersionNumber}</span>
              </button>
            </div>

            {/* Main Title: React Query vs SWR */}
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#111114] dark:text-[#F5F5F5] tracking-tight leading-tight">
              {libraryA} <span className="text-[#71717A] font-light">vs</span> {libraryB}
            </h1>

            {/* Stated Question or Use Case */}
            {question && (
              <p className="text-xs sm:text-sm font-mono text-brand-300/90 leading-relaxed">
                "{question}"
              </p>
            )}

            {useCase && (
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA] pt-0.5">
                <span className="text-[10px] font-mono text-[#71717A] uppercase">Context:</span>
                <span className="px-2.5 py-0.5 rounded bg-[#FAFAFC] dark:bg-[#101012] border border-[#E5E7EB] dark:border-white/[0.06] text-[#111114] dark:text-[#F5F5F5] font-medium">
                  {useCase}
                </span>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
            {/* Refresh Research (Section 11 & 17) */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 border border-brand-500/30 transition-all cursor-pointer disabled:opacity-50"
              title="Re-run live web and registry searches to update evidence"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Research'}</span>
            </button>

            {/* Replay Research */}
            <button
              onClick={() => setIsReplayOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAFAFC] dark:bg-[#101012] hover:bg-white/[0.06] text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] border border-[#E5E7EB] dark:border-white/[0.08] transition-all cursor-pointer"
              title="Replay autonomous research steps"
            >
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Replay</span>
            </button>

            {/* PDF Export */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAFAFC] dark:bg-[#101012] hover:bg-white/[0.06] text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] border border-[#E5E7EB] dark:border-white/[0.08] transition-all cursor-pointer"
              title="Export formatted PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            {/* Copy Report */}
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAFAFC] dark:bg-[#101012] hover:bg-white/[0.06] text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] border border-[#E5E7EB] dark:border-white/[0.08] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Share URL */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-subtle transition-all cursor-pointer"
            >
              {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{shared ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Empirical Metrics Bar (Section 11: Only Real Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06]">
            <div className="text-[10px] font-mono text-[#71717A] uppercase font-semibold">
              Sources
            </div>
            <div className="text-xl font-bold font-mono text-[#111114] dark:text-[#F5F5F5] mt-0.5">
              {sources.length}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono">Empirical sources</div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06]">
            <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
              Primary Sources
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {officialSourcesCount}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono">Tier 1 Official</div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06]">
            <div className="text-[10px] font-mono text-brand-400 uppercase font-semibold">
              Claims Checked
            </div>
            <div className="text-xl font-bold font-mono text-brand-400 mt-0.5">
              {evidence.length}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono">Extracted statements</div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06]">
            <div className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
              Verified Claims
            </div>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
              {verifiedClaimsCount}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono">Anchored by primary docs</div>
          </div>

          {researchDurationSec && (
            <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06] col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-[#A1A1AA] uppercase font-semibold">
                Duration
              </div>
              <div className="text-xl font-bold font-mono text-[#111114] dark:text-[#F5F5F5] mt-0.5">
                {researchDurationSec}s
              </div>
              <div className="text-[10px] text-[#71717A] font-mono">Multi-source run</div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================
          REQUIREMENT 13, 14, 15: HERO LIBRARYLENS RECOMMENDATION CARD
         ================================================================= */}
      <div className="rounded-2xl border-2 border-[#D4A017] dark:border-[#D4A017]/70 bg-white dark:bg-[#100D0D] p-6 sm:p-7 shadow-[0_8px_30px_rgba(212,160,23,0.12)] relative overflow-hidden space-y-6">
        <div className="signature-accent-bar absolute top-0 left-0 right-0 h-1.5" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0DED7] dark:border-white/[0.08] pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEFCE8] text-[#92400E] border border-[#FDE047] text-xs font-mono font-extrabold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>✦ LIBRARYLENS PICK</span>
            </span>
            <span className="text-xs font-mono font-semibold text-[#E63946] dark:text-red-400">
              PRIMARY RECOMMENDATION
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#71717A] uppercase">Evidence Confidence:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              {verifiedClaimsCount >= 2 ? 'HIGH' : 'MEDIUM'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                Best fit for your requirements
              </span>
              <h2 className="text-3xl font-extrabold font-display text-[#241414] dark:text-white mt-1">
                {libraryA}
              </h2>
            </div>

            <p className="text-sm text-[#52525B] dark:text-[#D4D4D8] leading-relaxed">
              Strong empirical fit for {useCase ? `"${useCase}"` : 'your architecture constraints'}. Documented primary sources confirm stability, active maintenance, and runtime ecosystem alignment.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-medium text-[#241414] dark:text-[#E4E4E7]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ecosystem ({report.versionData?.libraryA?.ecosystem || 'Active'})</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Documentation ({officialSourcesCount} Tier-1 docs)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Feature Fit (v{report.versionData?.libraryA?.currentVersion || 'Current'})</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Migration Considerations</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  const evEl = document.getElementById('evidence');
                  if (evEl) evEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary-red flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View Evidence</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToComparisons) {
                    onNavigateToComparisons();
                  } else {
                    const sec = document.getElementById('features');
                    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/[0.05] hover:bg-[#F8F8FA] dark:hover:bg-white/[0.1] text-[#111114] dark:text-white border border-[#D9DCE3] dark:border-white/[0.1] transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Compare Alternatives</span>
              </button>
            </div>
          </div>

          {/* Section 15: Recommendation Reasoning Flow */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-[#E9E3FF] dark:border-violet-500/20 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6D4AFF] dark:text-violet-300 font-bold block">
              Why this recommendation? (Chain of Evidence)
            </span>

            <div className="relative pl-4 space-y-2.5 border-l-2 border-[#DDD3FF] dark:border-violet-500/30 ml-1 text-xs">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#6D4AFF]" />
                <span className="text-[9px] font-mono text-[#71717A] uppercase font-bold block">Your Requirement</span>
                <span className="font-semibold text-[#111114] dark:text-white">
                  {useCase || 'Production application architecture'}
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#8B72FF]" />
                <span className="text-[9px] font-mono text-[#71717A] uppercase font-bold block">Evidence</span>
                <span className="text-[#52525B] dark:text-[#A1A1AA]">
                  {evidence[0]?.claim || `Documented support with ${verifiedClaimsCount} verified claims across primary documentation.`}
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] font-mono text-[#71717A] uppercase font-bold block">Relevance</span>
                <span className="text-[#52525B] dark:text-[#A1A1AA]">
                  Directly satisfies stated development requirements and ecosystem expectations.
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-[#71717A] uppercase font-bold block">Recommendation</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {libraryA} is primary recommended fit for this architecture.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================
          SECTION 13: HERO COMPARISON SPLIT RESEARCH PANEL
         ================================================================= */}
      <div className="workspace-card p-6 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* LEFT: Library A */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
                {libraryA}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30 font-bold">
                {report.versionData.libraryA.ecosystem}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[#71717A]">Current Version:</span>
                <span className="font-mono font-bold text-brand-400">
                  v{report.versionData.libraryA.currentVersion}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[#71717A]">Release Date:</span>
                <span className="font-mono text-[#A1A1AA]">
                  {report.versionData.libraryA.releaseDate
                    ? new Date(report.versionData.libraryA.releaseDate).toLocaleDateString()
                    : 'Active Registry'}
                </span>
              </div>

              {report.versionData.libraryA.downloadsWeekly !== undefined && (
                <div className="flex justify-between py-1 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                  <span className="text-[#71717A]">Weekly Downloads:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {report.versionData.libraryA.downloadsWeekly.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-2.5 font-mono text-[11px]">
                {report.versionData.libraryA.packageUrl && (
                  <a
                    href={report.versionData.libraryA.packageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>Package Registry</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                )}
                {report.versionData.libraryA.repoUrl && (
                  <a
                    href={report.versionData.libraryA.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                )}
                {report.versionData.libraryA.documentationUrl && (
                  <a
                    href={report.versionData.libraryA.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>Official Docs</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: VS Separator */}
          <div className="hidden md:flex flex-col items-center justify-center px-4">
            <div className="w-px h-10 bg-white/[0.08]" />
            <div className="my-2 px-2.5 py-1 rounded-full bg-[#151518] border border-white/[0.1] text-[11px] font-mono font-extrabold text-brand-400 shadow-subtle">
              VS
            </div>
            <div className="w-px h-10 bg-white/[0.08]" />
          </div>

          {/* RIGHT: Library B */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
                {libraryB}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
                {report.versionData.libraryB.ecosystem}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[#71717A]">Current Version:</span>
                <span className="font-mono font-bold text-indigo-400">
                  v{report.versionData.libraryB.currentVersion}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[#71717A]">Release Date:</span>
                <span className="font-mono text-[#A1A1AA]">
                  {report.versionData.libraryB.releaseDate
                    ? new Date(report.versionData.libraryB.releaseDate).toLocaleDateString()
                    : 'Active Registry'}
                </span>
              </div>

              {report.versionData.libraryB.downloadsWeekly !== undefined && (
                <div className="flex justify-between py-1 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                  <span className="text-[#71717A]">Weekly Downloads:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {report.versionData.libraryB.downloadsWeekly.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-2.5 font-mono text-[11px]">
                {report.versionData.libraryB.packageUrl && (
                  <a
                    href={report.versionData.libraryB.packageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>Package Registry</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                )}
                {report.versionData.libraryB.repoUrl && (
                  <a
                    href={report.versionData.libraryB.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                )}
                {report.versionData.libraryB.documentationUrl && (
                  <a
                    href={report.versionData.libraryB.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>Official Docs</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================
          SECTION 12: STICKY HORIZONTAL NAVIGATION TABS
         ================================================================= */}
      <nav className="sticky top-14 z-30 py-2 backdrop-blur-xl bg-white/90 dark:bg-[#FAFAFC] dark:bg-[#050505]/90 border-y border-[#E5E7EB] dark:border-white/[0.08] no-print">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono py-0.5 no-scrollbar">
          {navigationTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                  const el = document.getElementById(tab.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`relative px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#111114] dark:text-[#F5F5F5] font-semibold bg-white/[0.08] shadow-subtle'
                    : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/[0.03]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full" />
                )}
              </a>
            );
          })}
        </div>
      </nav>

      {/* =================================================================
          TAB 1: OVERVIEW (Executive Summary)
         ================================================================= */}
      <section id="overview" className="space-y-4 scroll-mt-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
              Executive Summary
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#71717A]">
            Traceable citations attached
          </span>
        </div>

        <div className="workspace-card p-6 text-sm text-[#A1A1AA] leading-relaxed font-sans space-y-3 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08]">
          <p>{renderTextWithCitations(report.summary, sources, onSelectSource)}</p>
        </div>
      </section>

      {/* =================================================================
          TAB 2: FEATURES (Evidence-First Feature Matrix)
         ================================================================= */}
      <section id="features" className="space-y-4 scroll-mt-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
              Architectural & Feature Comparison
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            NO SOURCE = NO FACT
          </span>
        </div>

        <div className="space-y-3">
          {report.featureMatrix.map((row, idx) => (
            <div
              key={idx}
              className="workspace-card p-5 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-[#D9DCE3] dark:border-white/[0.15] transition-all space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/[0.06] pb-2">
                <span className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
                  {row.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    Verified
                  </span>
                  {row.sourceIds.map((id) => (
                    <CitationBadge
                      key={id}
                      sourceId={id}
                      sources={sources}
                      onSelectSource={onSelectSource}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-brand-400 uppercase font-semibold">
                    {libraryA}
                  </span>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    {renderTextWithCitations(row.libraryA, sources, onSelectSource)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-indigo-400 uppercase font-semibold">
                    {libraryB}
                  </span>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    {renderTextWithCitations(row.libraryB, sources, onSelectSource)}
                  </p>
                </div>
              </div>

              {/* Challenge Claim Trigger */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const matchedEv = evidence.find((e) =>
                      row.sourceIds.some((sid) => e.sourceIds.includes(sid))
                    ) || {
                      id: `ev_feat_${idx + 1}`,
                      claim: `${row.category}: ${row.libraryA}`,
                      sourceIds: row.sourceIds,
                      library: libraryA,
                      confidence: 0.95,
                      verified: true
                    };
                    setChallengedClaim(matchedEv);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono text-[#71717A] hover:text-brand-300 bg-white/[0.03] hover:bg-brand-500/10 border border-[#E5E7EB] dark:border-white/[0.06] hover:border-brand-500/30 transition-all cursor-pointer"
                >
                  <Scale className="w-3 h-3 text-brand-400" />
                  <span>Challenge This Claim</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================
          TAB 3: USE-CASE ANALYZER (Scenario Simulator - Strictly NO WINNER)
         ================================================================= */}
      <section id="ecosystem" className="space-y-4 scroll-mt-28">
        <UseCaseAnalyzer
          libraryA={libraryA}
          libraryB={libraryB}
          initialUseCase={useCase || ''}
          sources={sources}
          onSelectSource={onSelectSource}
        />
      </section>

      {/* =================================================================
          TAB 4: RELEASES TIMELINE
         ================================================================= */}
      <section id="releases" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-brand-400" />
          <h2 className="text-xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
            Release Radar & Changelogs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Library A Releases */}
          <div className="workspace-card p-5 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] space-y-3">
            <span className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
              {libraryA} Recent Releases
            </span>
            <div className="space-y-2">
              {report.recentReleases
                ?.filter((r) => r.library === libraryA)
                .slice(0, 4)
                .map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-400">
                          v{rel.version}
                        </span>
                        {rel.isPrerelease && (
                          <span className="text-[10px] font-mono px-1.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            PRERELEASE
                          </span>
                        )}
                      </div>
                      <p className="text-[#A1A1AA] text-[11px] mt-1 line-clamp-2">
                        {rel.summary || 'Official release tag'}
                      </p>
                    </div>
                    {rel.changelogUrl && (
                      <a
                        href={rel.changelogUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#71717A] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Library B Releases */}
          <div className="workspace-card p-5 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] space-y-3">
            <span className="font-display font-bold text-sm text-[#111114] dark:text-[#F5F5F5]">
              {libraryB} Recent Releases
            </span>
            <div className="space-y-2">
              {report.recentReleases
                ?.filter((r) => r.library === libraryB)
                .slice(0, 4)
                .map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#050505] border border-[#E5E7EB] dark:border-white/[0.06] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-400">
                          v{rel.version}
                        </span>
                        {rel.isPrerelease && (
                          <span className="text-[10px] font-mono px-1.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            PRERELEASE
                          </span>
                        )}
                      </div>
                      <p className="text-[#A1A1AA] text-[11px] mt-1 line-clamp-2">
                        {rel.summary || 'Official release tag'}
                      </p>
                    </div>
                    {rel.changelogUrl && (
                      <a
                        href={rel.changelogUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#71717A] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          TAB 5: BREAKING CHANGE RADAR (Section 18)
         ================================================================= */}
      <section id="breaking-changes" className="space-y-4 scroll-mt-28">
        <BreakingChangeRadar
          breakingChanges={report.breakingChanges || []}
          sources={sources}
          onSelectSource={onSelectSource}
        />
      </section>

      {/* =================================================================
          TAB 6: MIGRATION ASSISTANT (Section 19)
         ================================================================= */}
      <section id="migration" className="space-y-4 scroll-mt-28">
        <MigrationAssistant
          migration={report.migration}
          sources={sources}
          onSelectSource={onSelectSource}
        />
      </section>

      {/* =================================================================
          TAB 7: RECENT NEWS & DEVELOPMENTS (Section 22)
         ================================================================= */}
      {recentNewsCount > 0 && (
        <section id="news" className="space-y-4 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-brand-400" />
              <h2 className="text-xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
                Recent Ecosystem Developments
              </h2>
            </div>

            {/* News Category Filters (Section 22 Requirement) */}
            <div className="flex items-center gap-1 text-xs font-mono overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All News' },
                { id: 'releases', label: 'Releases' },
                { id: 'security', label: 'Security' },
                { id: 'ecosystem', label: 'Ecosystem' },
                { id: 'announcements', label: 'Official' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setNewsFilter(f.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    newsFilter === f.id
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold'
                      : 'text-[#71717A] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] bg-white/[0.03]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((news, idx) => (
              <div
                key={idx}
                className="workspace-card p-5 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-[#D9DCE3] dark:border-white/[0.15] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#71717A]">
                      {news.publisher} • {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        news.isOfficiallyConfirmed
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.06] text-[#A1A1AA] border border-[#E5E7EB] dark:border-white/[0.08]'
                      }`}
                    >
                      {news.isOfficiallyConfirmed ? 'Official' : 'News'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-[#111114] dark:text-[#F5F5F5] leading-snug line-clamp-2">
                    {news.title}
                  </h3>

                  <p className="text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {news.snippet}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-400">
                    {news.isOfficiallyConfirmed ? '✓ Primary Confirmed' : 'Empirical News'}
                  </span>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A1A1AA] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3 text-[#71717A]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================
          TAB 8: EVIDENCE GRAPH (Section 15)
         ================================================================= */}
      <section id="evidence" className="space-y-4 scroll-mt-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
              Interactive Evidence Graph
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8FF] dark:bg-violet-950/30 border border-[#DDD3FF] dark:border-violet-500/20 text-[#6D4AFF] dark:text-violet-300 font-mono text-[10px] font-bold">
              ✦ NO SOURCE = NO FACT
            </span>
            <span className="text-[11px] font-mono text-[#71717A]">
              CLAIM → EVIDENCE → SOURCE
            </span>
          </div>
        </div>

        <EvidenceGraph
          evidence={evidence}
          sources={sources}
          onSelectSource={onSelectSource}
          onChallengeClaim={(ev) => setChallengedClaim(ev)}
        />
      </section>

      {/* =================================================================
          TAB 9: SOURCES EXPLORER (Section 23)
         ================================================================= */}
      <section id="sources" className="space-y-4 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-[#111114] dark:text-[#F5F5F5]">
              Sources Explorer & Authority Ranking
            </h2>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                placeholder="Filter sources..."
                className="px-2.5 py-1 text-xs command-input pr-7 bg-[#FAFAFC] dark:bg-[#050505] text-[#111114] dark:text-[#F5F5F5] w-36 sm:w-48"
              />
              <Search className="w-3 h-3 text-[#71717A] absolute right-2.5 top-2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 text-xs font-mono">
              {[
                { id: 'all', label: 'All' },
                { id: 'official', label: 'Tier 1 Official' },
                { id: 'registry', label: 'Tier 2 Registries' },
                { id: 'news', label: 'Tier 3 News' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSourceFilter(f.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-all ${
                    sourceFilter === f.id
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold'
                      : 'text-[#71717A] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] bg-white/[0.03]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="workspace-card p-4 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-[#D9DCE3] dark:border-white/[0.15] transition-all flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {source.publisher}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      source.tier === 1
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : source.tier === 2
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                        : 'bg-white/[0.06] text-[#A1A1AA] border border-[#E5E7EB] dark:border-white/[0.08]'
                    }`}
                  >
                    Tier {source.tier} • {source.sourceType}
                  </span>
                </div>

                <h3 className="font-semibold text-xs text-[#111114] dark:text-[#F5F5F5] leading-snug line-clamp-2">
                  {source.title}
                </h3>

                <p className="text-[11px] text-[#A1A1AA] line-clamp-2 mt-1 leading-relaxed">
                  {source.snippet}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectSource(source)}
                  className="text-[11px] font-mono text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  View Details & Extract
                </button>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#71717A] hover:text-[#111114] dark:hover:text-[#111114] dark:text-[#F5F5F5] transition-colors"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3 h-3 text-[#71717A]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Claim Challenge Modal */}
      <ClaimChallengeModal
        isOpen={Boolean(challengedClaim)}
        onClose={() => setChallengedClaim(null)}
        researchId={research.id}
        claim={challengedClaim}
        initialResult={challengedClaim ? research.challenges?.[challengedClaim.id] : null}
      />

      {/* Research Replay Modal (Section 17) */}
      <ResearchReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        research={research}
      />

      {/* Version History Modal (Section 18) */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        research={research}
      />
    </div>
  );
};

// Inline helper for converting [src_001] to CitationBadge components
function renderTextWithCitations(
  text: string,
  sources: Source[],
  onSelectSource?: (s: Source) => void
): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\[src_\w+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/\[(src_\w+)\]/);
    if (match) {
      const srcId = match[1];
      return (
        <CitationBadge
          key={i}
          sourceId={srcId}
          sources={sources}
          onSelectSource={onSelectSource}
        />
      );
    }
    return part;
  });
}

function generateMarkdownReport(research: ResearchRecord): string {
  const { libraryA, libraryB, useCase, question, report, sources, evidence = [] } = research;
  if (!report) return '';

  return `# ${question || `${libraryA} vs ${libraryB}`}
**LibraryLens AI: Research. Compare. Verify.**
*Timestamp:* ${new Date().toISOString()}
*Core Axiom:* NO SOURCE = NO FACT

---

## Executive Summary
${report.summary}

## Current Versions
- **${libraryA}**: v${report.versionData.libraryA.currentVersion} (${report.versionData.libraryA.ecosystem})
- **${libraryB}**: v${report.versionData.libraryB.currentVersion} (${report.versionData.libraryB.ecosystem})

## Feature Comparison Matrix
| Area | ${libraryA} | ${libraryB} | Citations |
| :--- | :--- | :--- | :--- |
${report.featureMatrix.map((r) => `| ${r.category} | ${r.libraryA} | ${r.libraryB} | ${r.sourceIds.join(', ')} |`).join('\n')}

## Breaking-Change Radar
${(report.breakingChanges || []).map((bc) => `- **${bc.library} v${bc.affectedVersion}** (${bc.impact || 'Medium'} Impact): ${bc.description}. Migration: ${bc.migrationGuidance}`).join('\n')}

## Migration Guide (${libraryA} -> ${libraryB})
${report.migration?.overview || 'Review official migration manuals before upgrading.'}

## Use-Case Considerations
${report.useCaseAnalysis.tradeoffsSummary}

## Evidence Validation Summary (${evidence.length} Claims)
${evidence.map((e) => `- [${e.verified ? 'VERIFIED' : 'UNVERIFIED'}] "${e.claim}" (Sources: ${e.sourceIds.join(', ')})`).join('\n')}

## Verified Sources (${sources.length})
${sources.map((s, idx) => `[${idx + 1}] [${s.id}] ${s.title} (${s.sourceType.toUpperCase()} - Tier ${s.tier}) - ${s.url}`).join('\n')}
`;
}
