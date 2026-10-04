import React from 'react';
import { ResearchRecord } from '../types';
import { Bookmark, ArrowRight, Trash2, Download, Printer, Share2 } from 'lucide-react';
import { formatTimeAgo } from '../utils/freshness';

interface SavedViewProps {
  savedItems: ResearchRecord[];
  onSelectResearch: (record: ResearchRecord) => void;
  onRemoveSaved: (id: string) => void;
  onNewResearch: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedItems,
  onSelectResearch,
  onRemoveSaved,
  onNewResearch,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#111114] dark:text-[#F5F5F5] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#6D4AFF]" />
            <span>Saved Research Reports</span>
          </h2>
          <p className="text-xs text-[#52525B] dark:text-[#71717A] mt-0.5">
            Bookmarked library comparison reports saved for quick reference
          </p>
        </div>

        <button
          onClick={onNewResearch}
          className="btn-primary"
        >
          <span>New Research</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      {savedItems.length === 0 ? (
        <div className="workspace-card p-12 text-center max-w-md mx-auto my-8 space-y-4 bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] dark:bg-brand-500/10 text-[#6D4AFF] dark:text-brand-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#111114] dark:text-[#F5F5F5]">
              No saved reports
            </h3>
            <p className="text-xs text-[#52525B] dark:text-[#71717A] mt-1 leading-relaxed">
              When viewing a research comparison, click the bookmark icon or "Save" button to save it here for fast retrieval.
            </p>
          </div>
          <button
            onClick={onNewResearch}
            className="btn-primary inline-flex items-center gap-1.5 mx-auto"
          >
            <span>Start a comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResearch(item)}
              className="workspace-card p-5 flex flex-col justify-between hover:border-[#6D4AFF]/40 cursor-pointer transition-all group bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-display font-bold text-base text-[#111114] dark:text-[#F5F5F5] group-hover:text-[#6D4AFF] transition-colors">
                    {item.libraryA} <span className="text-[#71717A] font-normal">vs</span> {item.libraryB}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSaved(item.id);
                    }}
                    className="p-1 text-[#71717A] hover:text-red-500 rounded transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.useCase && (
                  <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] line-clamp-2 mb-3">
                    {item.useCase}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#71717A]">
                  {formatTimeAgo(item.createdAt)}
                </span>
                <span className="font-semibold text-[#6D4AFF] dark:text-brand-400 text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
