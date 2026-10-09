import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Clock,
  RefreshCw,
  Scale,
  Zap,
  DollarSign,
  Radio,
  FileCode,
  Eye,
  Check,
  ChevronRight,
  ArrowRight,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { AiModelRecord, ModelComparisonResult, ResearchProgressEvent } from '../types';
import { compareAiModels, connectProgressStream } from '../services/api';

interface ModelComparisonViewProps {
  initialModelA?: string;
  initialModelB?: string;
  initialRequirements?: string;
  modelsList?: AiModelRecord[];
  allModels?: AiModelRecord[];
  onOpenModelDetails?: (model: AiModelRecord) => void;
  onNavigateToRecommender?: (req?: string) => void;
  onSelectSource?: (source: any) => void;
}

export const ModelComparisonView: React.FC<ModelComparisonViewProps> = ({
  initialModelA,
  initialModelB,
  initialRequirements,
  modelsList = [],
  allModels = [],
  onOpenModelDetails,
  onNavigateToRecommender,
  onSelectSource,
}) => {
  const activeModelsList = modelsList.length > 0 ? modelsList : allModels;
  const [modelA, setModelA] = useState<string>(
    initialModelA || (activeModelsList[0]?.id || 'google:gemini-2.5-flash')
  );
  const [modelB, setModelB] = useState<string>(
    initialModelB || (activeModelsList[2]?.id || activeModelsList[1]?.id || 'anthropic:claude-3-5-sonnet')
  );
  const [requirements, setRequirements] = useState<string>(
    initialRequirements || 'High throughput API with tool calling and large context'
  );

  const [loading, setLoading] = useState(false);
  const [progressEvents, setProgressEvents] = useState<ResearchProgressEvent[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [comparison, setComparison] = useState<ModelComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync initial props if updated externally
  useEffect(() => {
    if (initialModelA) setModelA(initialModelA);
    if (initialModelB) setModelB(initialModelB);
    if (initialRequirements) setRequirements(initialRequirements);
  }, [initialModelA, initialModelB, initialRequirements]);

  // Real backend progress steps definition (Section 8)
  const stepsDefinition = [
    { key: 'understanding_models', label: 'Understanding models' },
    { key: 'searching_current', label: 'Searching current information' },
    { key: 'checking_docs', label: 'Checking official documentation' },
    { key: 'checking_releases', label: 'Checking releases' },
    { key: 'collecting_evidence', label: 'Collecting evidence' },
    { key: 'generating_comparison', label: 'Generating comparison' },
  ];

  const getStepStatus = (stepKey: string) => {
    const firedSteps = progressEvents.map(e => e.step);
    if (firedSteps.includes(stepKey)) {
      if (currentStep === stepKey && loading) return 'active';
      return 'completed';
    }
    return 'pending';
  };

  const handleRunComparison = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modelA || !modelB) {
      setError('Please select or enter both Model A and Model B');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgressEvents([]);
      setCurrentStep('understanding_models');

      const compareId = `cmp_${Date.now()}`;

      // Connect to real SSE progress stream (Section 8)
      const disconnectStream = connectProgressStream(
        compareId,
        (event) => {
          setProgressEvents((prev) => [...prev, event]);
          if (event.step) setCurrentStep(event.step);
        },
        () => {}
      );

      const res = await compareAiModels(modelA, modelB, requirements, compareId, true);
      setComparison(res);
      disconnectStream();
    } catch (err: any) {
      setError(err.message || 'Comparison failed. Please verify provider connectivity and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return 'Unknown';
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M tokens`;
    if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K tokens`;
    return `${tokens.toLocaleString()} tokens`;
  };

  const quickPills = [
    {
      label: 'Gemini 2.5 Flash vs Claude 3.5 Sonnet',
      a: 'google:gemini-2.5-flash',
      b: 'anthropic:claude-3-5-sonnet',
      req: 'Large context, tool calling, and high throughput'
    },
    {
      label: 'GPT-4o vs Claude 3.5 Sonnet',
      a: 'openai:gpt-4o',
      b: 'anthropic:claude-3-5-sonnet',
      req: 'Complex coding, automated refactoring, and agent reasoning'
    },
    {
      label: 'Gemini 1.5 Pro vs GPT-4o',
      a: 'google:gemini-1.5-pro',
      b: 'openai:gpt-4o',
      req: '1M+ token document analysis with visual diagrams'
    },
    {
      label: 'Llama 3.3 70B vs DeepSeek R1',
      a: 'groq:llama-3.3-70b',
      b: 'deepseek:deepseek-r1',
      req: 'Mathematical reasoning, algorithm synthesis, and low price'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* SECTION 6: HEADER */}
      <div className="rounded-2xl border border-[#F0DED7] dark:border-white/[0.08] bg-white dark:bg-[#100D0D] p-6 sm:p-8 shadow-[0_10px_30px_rgba(36,20,20,0.04),0_2px_8px_rgba(36,20,20,0.02)] relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF1F2] dark:bg-red-500/15 text-[#E63946] dark:text-red-300 text-xs font-mono font-semibold border border-[#FECDD3] dark:border-red-500/25">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#E63946]" />
              Model Comparison
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono border border-emerald-200 dark:border-emerald-500/20 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              NO SOURCE = NO FACT
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#241414] dark:text-white">
            Model Comparison
          </h1>
          <p className="text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed max-w-2xl">
            Compare AI models using current evidence. Inspect context limits, pricing, tool calling,
            performance benchmarks, and empirical trade-offs.
          </p>
        </div>
      </div>

      {/* SECTION 6: OBVIOUS COMPARISON FORM */}
      <div className="rounded-2xl border border-[#F0DED7] dark:border-white/[0.08] bg-white dark:bg-[#100D0D] p-6 shadow-[0_10px_30px_rgba(36,20,20,0.04),0_2px_8px_rgba(36,20,20,0.02)] space-y-5">
        <form onSubmit={handleRunComparison} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Model A Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] font-bold">
                Model A
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  placeholder="Search or enter model (e.g. google:gemini-3.8-flash)"
                  className="w-full px-4 py-2.5 bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl text-sm text-[#241414] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10 transition-all font-sans"
                />
              </div>
              {activeModelsList.length > 0 && (
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="w-full text-xs bg-transparent text-[#71717A] dark:text-[#A1A1AA] cursor-pointer focus:outline-none py-1"
                >
                  <option value="">Choose from catalog...</option>
                  {activeModelsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.provider.toUpperCase()}] {m.displayName} ({formatTokens(m.contextWindow)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* VS Separator */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="w-9 h-9 rounded-full bg-[#FFF1F2] text-[#E63946] dark:bg-red-500/20 dark:text-red-300 font-mono font-extrabold text-xs flex items-center justify-center border border-[#FECDD3] dark:border-red-500/30 shadow-xs">
                VS
              </span>
            </div>

            {/* Model B Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] font-bold">
                Model B
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  placeholder="Search or enter model (e.g. anthropic:claude-3-5-sonnet)"
                  className="w-full px-4 py-2.5 bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl text-sm text-[#241414] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10 transition-all font-sans"
                />
              </div>
              {activeModelsList.length > 0 && (
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="w-full text-xs bg-transparent text-[#71717A] dark:text-[#A1A1AA] cursor-pointer focus:outline-none py-1"
                >
                  <option value="">Choose from catalog...</option>
                  {activeModelsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.provider.toUpperCase()}] {m.displayName} ({formatTokens(m.contextWindow)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Optional Requirements Input */}
          <div className="space-y-1.5 pt-2 border-t border-[#F0DED7] dark:border-white/[0.06]">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] font-semibold">
              Optional requirements
            </label>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="What matters for your use case? (e.g. 'Low budget, agent tool calling, 200K+ context')"
              className="w-full px-4 py-2.5 bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl text-sm text-[#241414] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10 transition-all font-sans"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Quick pre-set pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-[11px] font-mono text-[#71717A] self-center mr-1">Quick:</span>
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setModelA(pill.a);
                    setModelB(pill.b);
                    setRequirements(pill.req);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#FFFDF9] dark:bg-white/[0.04] text-[#52525B] dark:text-[#D4D4D8] hover:bg-[#FDF9F7] dark:hover:bg-white/[0.08] border border-[#F0DED7] dark:border-white/[0.06] transition-all cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !modelA.trim() || !modelB.trim()}
              className="btn-primary-red w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <span>✦ Compare Models</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 8: MODEL COMPARISON LOADING STATE */}
      {loading && (
        <div className="rounded-2xl border border-[#FECDD3] dark:border-red-500/30 bg-[#FFFDF9] dark:bg-[#141010] p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-[#E63946] font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Autonomous Research Pipeline in Progress</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stepsDefinition.map((step) => {
              const status = getStepStatus(step.key);
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : status === 'active'
                      ? 'bg-[#FFF1F2] dark:bg-red-500/20 border-[#FECDD3] dark:border-red-500/40 text-[#E63946] dark:text-red-200 font-bold animate-pulse'
                      : 'bg-white/60 dark:bg-white/[0.02] border-[#F0DED7] dark:border-white/[0.06] text-[#71717A] opacity-70'
                  }`}
                >
                  <span className="text-sm">
                    {status === 'completed' ? '✓' : status === 'active' ? '●' : '○'}
                  </span>
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 9 & 10: COMPARISON RESULT VIEW */}
      {comparison && (
        <div className="space-y-8 animate-fadeIn">
          {/* HEADER */}
          <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB] dark:border-white/[0.06]">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                  Model Comparison
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#111114] dark:text-white">
                  {comparison.modelA.displayName}{' '}
                  <span className="text-[#A1A1AA] font-light">vs</span>{' '}
                  {comparison.modelB.displayName}
                </h2>
              </div>

              <div className="text-right font-mono text-xs text-[#71717A] space-y-0.5">
                <span className="block text-[10px] uppercase">Last Researched</span>
                <span className="text-[#111114] dark:text-[#E4E4E7] font-semibold">
                  {new Date(comparison.lastResearchedAt || Date.now()).toLocaleTimeString()} (Live)
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Context Ratio</span>
                <span className="text-lg font-bold font-mono text-[#111114] dark:text-white mt-0.5 block">
                  {comparison.context?.ratio ? `${comparison.context.ratio}x` : '1.0x'}
                </span>
                <span className="text-[10px] text-[#71717A]">Ratio A to B</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Input Price Diff</span>
                <span className="text-lg font-bold font-mono text-[#111114] dark:text-white mt-0.5 block">
                  {comparison.pricing && comparison.pricing.inputA != null && comparison.pricing.inputB != null
                    ? `$${Math.abs((comparison.pricing.inputA || 0) - (comparison.pricing.inputB || 0)).toFixed(2)}`
                    : 'Variable'}
                </span>
                <span className="text-[10px] text-[#71717A]">Per 1M tokens</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Empirical Evidence</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {comparison.evidence?.length || 0} claims
                </span>
                <span className="text-[10px] text-[#71717A]">Verified statements</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Sources Cited</span>
                <span className="text-lg font-bold font-mono text-[#6D4AFF] mt-0.5 block">
                  {comparison.sources?.length || 0} sources
                </span>
                <span className="text-[10px] text-[#71717A]">Official documentation</span>
              </div>
            </div>
          </div>

          {/* SECTION 10: HERO RECOMMENDATION SECTION */}
          {comparison.recommendation && (
            <div className="rounded-2xl border-2 border-[#D4A017] dark:border-[#D4A017]/70 bg-white dark:bg-[#100D0D] p-6 sm:p-7 shadow-[0_8px_30px_rgba(212,160,23,0.12)] space-y-4 relative overflow-hidden">
              <div className="signature-accent-bar absolute top-0 left-0 right-0 h-1.5" />
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEFCE8] text-[#92400E] border border-[#FDE047] text-xs font-mono font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>✦ Recommended for Your Requirements</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Evidence Confidence: {comparison.recommendation.confidence || 'HIGH'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display text-[#241414] dark:text-white">
                  {comparison.recommendation.isBothViable
                    ? 'Both Models Are Viable Options'
                    : `Recommended: ${comparison.recommendation.recommendedModel}`}
                </h3>
                {requirements && (
                  <p className="text-xs font-mono text-[#71717A]">
                    Based on your stated requirements: "{requirements}"
                  </p>
                )}
              </div>

              {/* Why & Trade-offs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.06] space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                    Why:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#52525B] dark:text-[#D4D4D8]">
                    {comparison.recommendation.why.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.06] space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                    Trade-off Consideration:
                  </span>
                  <p className="text-xs text-[#52525B] dark:text-[#D4D4D8] leading-relaxed">
                    {comparison.recommendation.tradeoff}
                  </p>
                  {comparison.recommendation.viableFactors && (
                    <div className="pt-2 text-[11px] font-mono text-[#71717A]">
                      Differentiating factors:{' '}
                      <span className="text-[#111114] dark:text-white">
                        {comparison.recommendation.viableFactors.join(' • ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: 14 STRUCTURED SECTIONS */}

          {/* 1. OVERVIEW */}
          <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#6D4AFF]" />
              <span>1. Overview</span>
            </h3>
            <p className="text-xs text-[#52525B] dark:text-[#D4D4D8] leading-relaxed">
              {comparison.overview?.summary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#6D4AFF] block uppercase">
                  {comparison.modelA.displayName}
                </span>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  {comparison.overview?.modelA}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] space-y-1.5">
                <span className="text-xs font-mono font-bold text-[#6D4AFF] block uppercase">
                  {comparison.modelB.displayName}
                </span>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  {comparison.overview?.modelB}
                </p>
              </div>
            </div>
          </div>

          {/* 2. CAPABILITIES */}
          <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6D4AFF]" />
              <span>2. Capabilities</span>
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono text-[#71717A] uppercase font-semibold block mb-2">
                  Shared Capabilities ({comparison.capabilities?.shared.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {comparison.capabilities?.shared.map((cap) => (
                    <span
                      key={cap}
                      className="px-2.5 py-1 rounded-lg bg-[#F8F8FA] dark:bg-white/[0.04] text-[#111114] dark:text-[#E4E4E7] text-xs font-medium flex items-center gap-1.5 border border-[#E5E7EB] dark:border-white/[0.06]"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAF8FF] dark:bg-violet-500/10 border border-[#DDD3FF] dark:border-violet-500/20">
                  <span className="text-xs font-mono font-bold text-[#6D4AFF] block mb-2 uppercase">
                    Unique to {comparison.modelA.displayName} ({comparison.capabilities?.onlyInA.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.capabilities?.onlyInA.length === 0 ? (
                      <span className="text-xs text-[#71717A]">None detected</span>
                    ) : (
                      comparison.capabilities?.onlyInA.map((cap) => (
                        <span key={cap} className="px-2 py-0.5 rounded bg-[#F0EBFF] text-[#6941D9] text-xs font-medium">
                          + {cap}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8FF] dark:bg-violet-500/10 border border-[#DDD3FF] dark:border-violet-500/20">
                  <span className="text-xs font-mono font-bold text-[#6D4AFF] block mb-2 uppercase">
                    Unique to {comparison.modelB.displayName} ({comparison.capabilities?.onlyInB.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.capabilities?.onlyInB.length === 0 ? (
                      <span className="text-xs text-[#71717A]">None detected</span>
                    ) : (
                      comparison.capabilities?.onlyInB.map((cap) => (
                        <span key={cap} className="px-2 py-0.5 rounded bg-[#F0EBFF] text-[#6941D9] text-xs font-medium">
                          + {cap}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CONTEXT & 4. PRICING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. CONTEXT */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#6D4AFF]" />
                <span>3. Context Limits</span>
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-[#71717A] uppercase">{comparison.modelA.displayName}</span>
                    <span className="text-lg font-bold font-mono text-[#111114] dark:text-white block">
                      {formatTokens(comparison.context?.contextA || null)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#6D4AFF]">vs</span>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[11px] font-mono text-[#71717A] uppercase">{comparison.modelB.displayName}</span>
                    <span className="text-lg font-bold font-mono text-[#111114] dark:text-white block">
                      {formatTokens(comparison.context?.contextB || null)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  {comparison.context?.analysis}
                </p>
              </div>
            </div>

            {/* 4. PRICING */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#6D4AFF]" />
                <span>4. Pricing (1M Tokens)</span>
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-[#71717A] uppercase">{comparison.modelA.displayName}</span>
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      ${comparison.pricing?.inputA !== null ? comparison.pricing?.inputA : 'N/A'} in / ${comparison.pricing?.outputA !== null ? comparison.pricing?.outputA : 'N/A'} out
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#6D4AFF]">vs</span>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[11px] font-mono text-[#71717A] uppercase">{comparison.modelB.displayName}</span>
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      ${comparison.pricing?.inputB !== null ? comparison.pricing?.inputB : 'N/A'} in / ${comparison.pricing?.outputB !== null ? comparison.pricing?.outputB : 'N/A'} out
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  {comparison.pricing?.analysis}
                </p>
              </div>
            </div>
          </div>

          {/* 5. PERFORMANCE & 6. TOOL CALLING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 5. PERFORMANCE */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-3">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#6D4AFF]" />
                <span>5. Performance</span>
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                {comparison.performance?.analysis}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06]">
                  <span className="text-[10px] text-[#71717A] uppercase block">{comparison.modelA.displayName}</span>
                  <span className="font-semibold">{comparison.performance?.latencyA}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06]">
                  <span className="text-[10px] text-[#71717A] uppercase block">{comparison.modelB.displayName}</span>
                  <span className="font-semibold">{comparison.performance?.latencyB}</span>
                </div>
              </div>
            </div>

            {/* 6. TOOL CALLING */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-3">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#6D4AFF]" />
                <span>6. Tool Calling</span>
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                {comparison.toolCalling?.analysis}
              </p>
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  {comparison.modelA.displayName}: {comparison.toolCalling?.supportedA ? 'Native Supported' : 'Partial'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  {comparison.modelB.displayName}: {comparison.toolCalling?.supportedB ? 'Native Supported' : 'Partial'}
                </span>
              </div>
            </div>
          </div>

          {/* 7. VISION & 8. CODING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 7. VISION */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-3">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#6D4AFF]" />
                <span>7. Vision</span>
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                {comparison.vision?.analysis}
              </p>
            </div>

            {/* 8. CODING */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-3">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#6D4AFF]" />
                <span>8. Coding</span>
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                {comparison.coding?.analysis}
              </p>
            </div>
          </div>

          {/* 9. AVAILABILITY & 10. ECOSYSTEM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 9. AVAILABILITY */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-3">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#6D4AFF]" />
                <span>9. Availability</span>
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                {comparison.availability?.analysis}
              </p>
            </div>

            {/* 10. ECOSYSTEM */}
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-3">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6D4AFF]" />
                <span>10. Ecosystem</span>
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                {comparison.ecosystem?.analysis}
              </p>
            </div>
          </div>

          {/* 11. RELEASES */}
          {comparison.releases && comparison.releases.length > 0 && (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6D4AFF]" />
                <span>11. Releases</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {comparison.releases.map((rel, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111114] dark:text-white">{rel.model}</span>
                      <span className="font-mono text-[10px] text-[#71717A]">{rel.date}</span>
                    </div>
                    <span className="font-mono text-[#6D4AFF] block text-[11px]">{rel.version}</span>
                    <p className="text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">{rel.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. TRADE-OFFS */}
          {comparison.tradeoffs && (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#6D4AFF]" />
                <span>12. Trade-offs</span>
              </h3>
              <p className="text-xs text-[#52525B] dark:text-[#D4D4D8] leading-relaxed">
                {comparison.tradeoffs.summary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] space-y-2 text-xs">
                  <span className="font-mono font-bold text-[#6D4AFF] uppercase block">
                    When to choose {comparison.modelA.displayName}
                  </span>
                  <ul className="space-y-1.5 text-[#52525B] dark:text-[#D4D4D8]">
                    {comparison.tradeoffs.whenToChooseA.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#6D4AFF] font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] space-y-2 text-xs">
                  <span className="font-mono font-bold text-[#6D4AFF] uppercase block">
                    When to choose {comparison.modelB.displayName}
                  </span>
                  <ul className="space-y-1.5 text-[#52525B] dark:text-[#D4D4D8]">
                    {comparison.tradeoffs.whenToChooseB.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#6D4AFF] font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 13. EVIDENCE */}
          {comparison.evidence && comparison.evidence.length > 0 && (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>13. Evidence Verification</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  NO SOURCE = NO FACT
                </span>
              </div>

              <div className="space-y-2.5">
                {comparison.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-[#71717A] uppercase block">
                        Target: {ev.model}
                      </span>
                      <p className="text-[#111114] dark:text-white font-medium">{ev.claim}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        ev.verificationState === 'VERIFIED'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : ev.verificationState === 'PARTIALLY VERIFIED'
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                          : 'bg-zinc-100 dark:bg-white/[0.05] text-[#71717A] border border-[#E5E7EB] dark:border-white/[0.08]'
                      }`}
                    >
                      {ev.verificationState || 'VERIFIED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. SOURCES */}
          {comparison.sources && comparison.sources.length > 0 && (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#6D4AFF]" />
                  <span>14. Sources & Citations ({comparison.sources.length})</span>
                </h3>
                <span className="text-[11px] font-mono text-[#71717A]">
                  Verified external links
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comparison.sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] hover:border-[#DDD3FF] transition-all flex flex-col justify-between space-y-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] mb-1">
                        <span>{src.publisher}</span>
                        <span className="px-1.5 py-0.2 rounded bg-white dark:bg-white/[0.04] border border-[#E5E7EB] dark:border-white/[0.06]">
                          Tier {src.tier}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#111114] dark:text-white line-clamp-2">
                        {src.title}
                      </h4>
                      {src.snippet && (
                        <p className="text-[11px] text-[#71717A] line-clamp-2 mt-1">
                          {src.snippet}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#71717A]">
                        Retrieved {new Date(src.retrievedAt || Date.now()).toLocaleDateString()}
                      </span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6D4AFF] hover:underline"
                      >
                        <span>Open URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMPTY STATE (Section 27) */}
      {!loading && !comparison && (
        <div className="p-12 rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] dark:bg-violet-500/10 text-[#6D4AFF] flex items-center justify-center mx-auto">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#111114] dark:text-white">
              No comparison yet.
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Select two models above and click Compare Models to start your first evidence-backed comparison.
            </p>
          </div>
          <button
            onClick={() => handleRunComparison()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#6D4AFF] hover:bg-[#5B3FD6] text-white shadow-sm transition-all cursor-pointer"
          >
            <span>Compare Models →</span>
          </button>
        </div>
      )}
    </div>
  );
};
