import React, { useState, useEffect } from 'react';
import { ResearchRecord } from '../types';
import { fetchResearchHistory, deleteResearchRecord, triggerRefreshResearch } from '../services/api';
import {
  Clock,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  ArrowRight,
  Share2,
  Check,
  Sparkles
} from 'lucide-react';
import { formatTimeAgo, evaluateSourceFreshness } from '../utils/freshness';

interface HistoryViewProps {
  onSelectResearch: (record: ResearchRecord) => void;
  onNewResearch: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectResearch, onNewResearch }) => {
  const [historyItems, setHistoryItems] = useState<ResearchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchResearchHistory();
      setHistoryItems(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load research history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteResearchRecord(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
    }
  };

  const handleRefresh = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRefreshingId(id);
    try {
      const updated = await triggerRefreshResearch(id);
      setHistoryItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err: any) {
      setError(err.message || 'Failed to refresh research');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/research/${id}`;
    navigator.clipboard.writeText(url);
    setSharedId(id);
    setTimeout(() => setSharedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#F5F5F5] flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-400" />
            <span>Research History</span>
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Empirical comparison records saved in your persistence repository
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="p-2 rounded-lg text-[#71717A] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNewResearch}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-subtle"
          >
            <span>New Research</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="workspace-card p-12 text-center text-[#71717A] text-xs font-mono bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08]">
          Loading empirical research history...
        </div>
      ) : error ? (
        <div className="workspace-card p-6 text-center text-red-500 text-xs bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      ) : historyItems.length === 0 ? (
        /* Empty State */
        <div className="workspace-card p-12 text-center max-w-md mx-auto my-8 space-y-4 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] dark:bg-brand-500/10 text-[#6D4AFF] dark:text-brand-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#111114] dark:text-[#F5F5F5]">
              No research records yet
            </h3>
            <p className="text-xs text-[#52525B] dark:text-[#71717A] mt-1 leading-relaxed">
              Compare any two software libraries using current technical evidence, official documentation, and verified citations.
            </p>
          </div>
          <button
            onClick={onNewResearch}
            className="btn-primary inline-flex items-center gap-1.5 mx-auto"
          >
            <span>Start your first research</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* History Items List (Section 24) */
        <div className="space-y-3">
          {historyItems.map((item) => {
            const freshness = evaluateSourceFreshness(
              item.sources?.[0]?.publishedAt || null,
              item.lastResearchedAt || item.updatedAt || item.createdAt,
              'web',
              item.lastVerifiedAt
            );

            return (
              <div
                key={item.id}
                onClick={() => onSelectResearch(item)}
                className="workspace-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#6D4AFF]/40 cursor-pointer transition-all group bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-[#111114] dark:text-[#F5F5F5] group-hover:text-[#6D4AFF] transition-colors truncate">
                      {item.libraryA} <span className="text-[#71717A] font-normal">vs</span> {item.libraryB}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        freshness.category === 'FRESH'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : freshness.category === 'AGING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}
                    >
                      {freshness.category}
                    </span>
                  </div>

                  {item.useCase && (
                    <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] font-medium truncate">
                      Use Case: <span className="text-[#111114] dark:text-[#F5F5F5] font-semibold">{item.useCase}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A] mt-1">
                    <span>{formatTimeAgo(item.updatedAt || item.createdAt)}</span>
                    <span>•</span>
                    <span>{item.sources?.length || 0} Sources</span>
                    <span>•</span>
                    <span>{item.evidence?.filter((e) => e.verified).length || 0} Verified</span>
                  </div>
                </div>

                {/* Section 24 Actions: Open, Refresh, Share, Delete */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={(e) => handleRefresh(e, item.id)}
                    disabled={refreshingId === item.id}
                    className="p-2 text-[#71717A] hover:text-brand-300 rounded-lg hover:bg-white/[0.06] transition-colors"
                    title="Refresh research with live search"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingId === item.id ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleShare(e, item.id)}
                    className="p-2 text-[#71717A] hover:text-[#F5F5F5] rounded-lg hover:bg-white/[0.06] transition-colors"
                    title="Copy shareable URL"
                  >
                    {sharedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-[#71717A] hover:text-red-400 rounded-lg hover:bg-white/[0.06] transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-400 group-hover:translate-x-0.5 transition-transform ml-1">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
