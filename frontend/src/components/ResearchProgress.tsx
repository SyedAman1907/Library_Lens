import React, { useState, useEffect, useRef } from 'react';
import { ResearchProgressEvent } from '../types';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  Search,
  BookOpen,
  GitBranch,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Check
} from 'lucide-react';

interface ResearchProgressProps {
  libraryA: string;
  libraryB: string;
  question?: string;
  events: ResearchProgressEvent[];
  currentEvent: ResearchProgressEvent | null;
}

export const ResearchProgress: React.FC<ResearchProgressProps> = ({
  libraryA,
  libraryB,
  question,
  events,
  currentEvent,
}) => {
  const percent = currentEvent ? currentEvent.progressPercent : 8;
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal on new events
  useEffect(() => {
    if (showTerminal) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, showTerminal]);

  // Operations list with status mapping (Section 18 & 19)
  const timelineSteps = [
    { id: 'analyzing_question', label: 'Understanding request', threshold: 10 },
    { id: 'resolving_libraries', label: 'Identifying libraries', threshold: 18 },
    { id: 'official_docs', label: 'Searching official documentation', threshold: 35 },
    { id: 'package_metadata', label: 'Checking package metadata', threshold: 50 },
    { id: 'github_releases', label: 'Investigating releases', threshold: 65 },
    { id: 'breaking_changes', label: 'Checking breaking changes', threshold: 72 },
    { id: 'recent_developments', label: 'Searching current ecosystem news', threshold: 82 },
    { id: 'evidence_graph', label: 'Building evidence graph', threshold: 92 },
    { id: 'generating_comparison', label: 'Generating comparison', threshold: 99 },
  ];

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) {
      const now = new Date();
      return now.toTimeString().split(' ')[0];
    }
    try {
      const d = new Date(isoString);
      return d.toTimeString().split(' ')[0];
    } catch {
      return '00:00:00';
    }
  };

  // Clean title without quotes unless in data (Section 15)
  const displayTitle = question
    ? question.replace(/^["']|["']$/g, '')
    : `${libraryA} vs ${libraryB}`;

  return (
    <div className="max-w-4xl mx-auto w-full rounded-[18px] bg-white dark:bg-[#0C0C0F] border border-[#E5E7EB] dark:border-white/[0.08] shadow-[0_10px_30px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.03)] p-6 sm:p-8 relative overflow-hidden space-y-6">
      {/* SECTION 14 & 15: Header */}
      <div className="space-y-3 pb-5 border-b border-[#E5E7EB] dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6D4AFF] dark:text-violet-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6D4AFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6D4AFF]"></span>
            </span>
            <span>RESEARCHING</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-xl sm:text-2xl font-black text-[#6D4AFF] dark:text-violet-400">
              {percent}%
            </span>
            <span className="text-[10px] text-[#71717A] uppercase font-semibold">COMPLETED</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-[26px] font-[650] font-display text-[#111114] dark:text-white leading-snug tracking-tight">
          {displayTitle}
        </h2>
      </div>

      {/* SECTION 16: Progress Indicator (Track #EEEEF2, Gradient #6D4AFF to #8B72FF, Height 5-6px) */}
      <div className="w-full bg-[#EEEEF2] dark:bg-[#16161A] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6D4AFF] to-[#8B72FF] transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(109,74,255,0.35)]"
          style={{ width: `${Math.max(percent, 6)}%` }}
        />
      </div>

      {/* SECTION 17: Connection Status Card (#FAFAFC, border #E5E7EB) */}
      <div className="px-4 py-3 rounded-xl bg-[#FAFAFC] dark:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Loader2 className="w-3.5 h-3.5 text-[#6D4AFF] animate-spin shrink-0" />
          <span className="text-[#111114] dark:text-[#F5F5F5] font-medium truncate">
            {currentEvent?.message || 'Connected to research stream'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#71717A] shrink-0 ml-3">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* SECTION 18 & 19: Research Progress Timeline (Connected rows with connector lines) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#A1A1AA] font-semibold">
            Research Progress Timeline
          </span>
          <span className="text-[10px] font-mono text-[#71717A]">
            {timelineSteps.filter(s => percent >= s.threshold).length} of {timelineSteps.length} steps completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 relative">
          {timelineSteps.map((step, idx) => {
            const isCompleted = percent >= step.threshold;
            const isCurrent =
              percent < step.threshold &&
              (percent >= (timelineSteps[idx - 1]?.threshold || 0));

            return (
              <div
                key={step.id}
                className="relative flex items-center gap-3 py-2 px-2.5 rounded-lg transition-colors hover:bg-[#F8F8FA] dark:hover:bg-white/[0.02]"
              >
                {/* Indicator icon */}
                <div className="relative flex items-center justify-center shrink-0 z-10">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-[#16A34A] border border-emerald-200 dark:border-emerald-500/30">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-[#F2EEFF] dark:bg-violet-500/20 flex items-center justify-center text-[#6D4AFF] border border-[#DDD3FF] dark:border-violet-500/40">
                      <div className="w-2 h-2 rounded-full bg-[#6D4AFF] animate-ping" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#D9DCE3] dark:border-white/[0.2] flex items-center justify-center text-[#A1A1AA]" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-xs truncate ${
                    isCompleted
                      ? 'text-[#111114] dark:text-[#E4E4E7] font-medium'
                      : isCurrent
                      ? 'text-[#6D4AFF] dark:text-violet-300 font-semibold'
                      : 'text-[#A1A1AA] dark:text-[#71717A]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 20: Research Activity / White Terminal Panel */}
      <div className="border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl overflow-hidden bg-[#FAFAFA] dark:bg-[#111114]">
        <button
          type="button"
          onClick={() => setShowTerminal(!showTerminal)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#0C0C0F] hover:bg-[#F8F8FA] dark:hover:bg-[#151518] border-b border-[#E5E7EB] dark:border-white/[0.06] text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-[#52525B] dark:text-[#A1A1AA]">
            <Terminal className="w-3.5 h-3.5 text-[#6D4AFF]" />
            <span className="font-semibold text-[#111114] dark:text-[#F5F5F5]">Research Activity</span>
            <span className="text-[10px] text-[#71717A] font-mono">({events.length} events logged)</span>
          </div>
          <div className="flex items-center gap-1 text-[#71717A] text-[11px] font-medium">
            <span>{showTerminal ? 'Collapse ↑' : 'Expand ↓'}</span>
          </div>
        </button>

        {showTerminal && (
          <div className="max-h-48 overflow-y-auto p-3.5 space-y-1.5 font-mono text-[11px] leading-relaxed bg-[#FAFAFA] dark:bg-[#0E0E12]">
            {events.length === 0 ? (
              <div className="text-[#A1A1AA] italic py-2">
                Awaiting initial tool execution stream from MCP & SerpApi...
              </div>
            ) : (
              events.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#A1A1AA] shrink-0 select-none">
                    {formatTimestamp(ev.timestamp)}
                  </span>
                  <span
                    className={`truncate ${
                      ev.step.includes('warning')
                        ? 'text-amber-600 dark:text-amber-400'
                        : ev.progressPercent === 100
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-[#3F3F46] dark:text-[#D4D4D8]'
                    }`}
                  >
                    {ev.message}
                  </span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* SECTION 21: Bottom Verification Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-4 border-t border-[#E5E7EB] dark:border-white/[0.06]">
        <div className="flex items-start sm:items-center gap-2 text-[#52525B] dark:text-[#A1A1AA]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="leading-tight">
            <span className="font-semibold text-[#111114] dark:text-white block sm:inline mr-1.5">
              Real-time verification layer
            </span>
            <span className="text-[11px] text-[#71717A]">
              Live SerpApi & registry data
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono">
          <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold">Principle:</span>
          <span className="text-[#6D4AFF] dark:text-violet-400 font-bold tracking-wider text-xs">
            NO SOURCE = NO FACT
          </span>
        </div>
      </div>
    </div>
  );
};
