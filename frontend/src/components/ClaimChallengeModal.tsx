import React, { useState, useEffect } from 'react';
import { Evidence, ClaimChallengeResult, ClaimVerificationState } from '../types';
import { challengeClaimApi } from '../services/api';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
  Search,
  Scale
} from 'lucide-react';

interface ClaimChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchId: string;
  claim: Evidence | null;
  initialResult?: ClaimChallengeResult | null;
}

export const ClaimChallengeModal: React.FC<ClaimChallengeModalProps> = ({
  isOpen,
  onClose,
  researchId,
  claim,
  initialResult = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimChallengeResult | null>(initialResult);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const challengeSteps = [
    'Extracting claim statement...',
    'Performing fresh live search via SerpApi...',
    'Searching primary documentation & release logs...',
    'Searching for contradictory evidence & issue trackers...',
    'Evaluating confidence & synthesizing verification status...',
  ];

  const runChallenge = async (claimItem: Evidence) => {
    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    // Simulate step ticker during search
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < challengeSteps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const data = await challengeClaimApi(researchId, claimItem.id, claimItem.claim);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to challenge claim. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && claim) {
      if (initialResult) {
        setResult(initialResult);
        setLoading(false);
      } else {
        runChallenge(claim);
      }
    } else {
      setResult(null);
      setError(null);
    }
  }, [isOpen, claim, initialResult]);

  if (!isOpen || !claim) return null;

  const getBadgeForState = (state: ClaimVerificationState) => {
    switch (state) {
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          label: 'VERIFIED',
          desc: 'Corroborated by official primary documentation without significant contradictory evidence.',
        };
      case 'CONFLICTING EVIDENCE':
        return {
          bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          label: 'CONFLICTING EVIDENCE',
          desc: 'Primary sources document this capability, but active bug reports or caveats report edge-case limitations.',
        };
      case 'PARTIALLY VERIFIED':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: <HelpCircle className="w-4 h-4 text-blue-400" />,
          label: 'PARTIALLY VERIFIED',
          desc: 'Partially documented; direct primary certainty is incomplete in current releases.',
        };
      case 'UNVERIFIED':
      default:
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
          label: 'UNVERIFIED',
          desc: 'No sufficient verified evidence was found.',
        };
    }
  };

  const badge = result ? getBadgeForState(result.verificationState) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="workspace-card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-white/[0.1] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-500" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-bold">
              Signature Claim Validation Layer
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Target Claim Box */}
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1.5">
              <span>Original Claim Under Audit</span>
              <span>Target: {claim.library}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              "{claim.claim}"
            </p>
          </div>

          {/* Loading Animation during Fresh Challenge Search */}
          {loading && (
            <div className="py-8 px-4 rounded-xl workspace-card-subtle flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <div>
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Executing Live Claim Audit
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {challengeSteps[currentStepIndex]}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Verification Results View */}
          {!loading && result && (
            <div className="space-y-5">
              {/* Verdict Header */}
              {badge && (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${badge.bg}`}>
                  <div className="flex items-center gap-2.5">
                    {badge.icon}
                    <div>
                      <span className="font-mono font-bold tracking-wider text-xs block">
                        {badge.label}
                      </span>
                      <span className="text-[11px] opacity-90 block mt-0.5">
                        {badge.desc}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono opacity-80 block uppercase">Confidence</span>
                    <span className="font-mono font-bold text-sm">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Supporting Evidence List */}
              <div>
                <h4 className="font-mono text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Supporting Evidence ({result.supportingEvidence.length})</span>
                </h4>

                {result.supportingEvidence.length > 0 ? (
                  <div className="space-y-2">
                    {result.supportingEvidence.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-lg workspace-card-subtle border border-emerald-500/20">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {s.title}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 shrink-0">
                            TIER {s.tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                          {s.snippet}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{s.publisher}</span>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Inspect Source</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg workspace-card-subtle text-slate-400 font-mono text-[11px]">
                    No sufficient verified evidence was found.
                  </div>
                )}
              </div>

              {/* Contradictory Evidence List */}
              <div>
                <h4 className="font-mono text-[11px] uppercase font-bold text-amber-500 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Contradictory / Critical Evidence ({result.contradictoryEvidence.length})</span>
                </h4>

                {result.contradictoryEvidence.length > 0 ? (
                  <div className="space-y-2">
                    {result.contradictoryEvidence.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-lg workspace-card-subtle border border-amber-500/30">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {s.title}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 shrink-0">
                            WARNING FLAG
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                          {s.snippet}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{s.publisher}</span>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Inspect Issue/Notice</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg workspace-card-subtle text-slate-400 font-mono text-[11px]">
                    No authoritative contradictory evidence or breaking incompatibilities were identified in live primary searches.
                  </div>
                )}
              </div>

              {/* Synthesis Note */}
              <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Empirical Synthesis
                </span>
                <p>{result.synthesis}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-[10px] font-mono text-slate-400">
            {result?.challengedAt
              ? `Challenged at ${new Date(result.challengedAt).toLocaleTimeString()}`
              : 'Empirical verification agent'}
          </span>
          <div className="flex items-center gap-2">
            {claim && !loading && (
              <button
                type="button"
                onClick={() => runChallenge(claim)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-brand-500" />
                <span>Re-challenge</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
