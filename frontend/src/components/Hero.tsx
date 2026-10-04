import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Boxes,
  Cpu,
  Layers,
  Check,
  ExternalLink,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { AiModelRecord } from '../types';

export type ResearchType = 'recommendation' | 'library_comparison' | 'model_comparison' | 'explore_ecosystem';

interface HeroProps {
  onSearch: (
    input: string | { question?: string; libraryA?: string; libraryB?: string; useCase?: string; options?: { includeNews?: boolean; includeVisuals?: boolean; depth?: string } },
    libraryB?: string,
    useCase?: string,
    options?: { includeNews: boolean; includeVisuals: boolean }
  ) => void;
  isLoading: boolean;
  initialLibA?: string;
  initialLibB?: string;
  onOpenModelRadar?: () => void;
  onNavigateToRecommendations?: (prefillPrompt?: string) => void;
  onCompareModels?: (modelA: string, modelB: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  isLoading,
  initialLibA = 'React Query',
  initialLibB = 'SWR',
  onOpenModelRadar,
  onNavigateToRecommendations,
  onCompareModels,
}) => {
  // Mode selector: default is 'recommendation'
  const [researchType, setResearchType] = useState<ResearchType>('recommendation');

  // Recommendation inputs
  const [projectDescription, setProjectDescription] = useState('AI coding assistant with strong reasoning, tool calling, and large context');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['Coding', 'Context', 'Tool Calling']);
  const [budget, setBudget] = useState<'low' | 'medium' | 'flexible'>('medium');
  const [contextReq, setContextReq] = useState('128K+');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Library comparison inputs
  const [libA, setLibA] = useState(initialLibA);
  const [libB, setLibB] = useState(initialLibB);
  const [libUseCase, setLibUseCase] = useState('High-throughput production microservice');

  // Model comparison inputs
  const [modelA, setModelA] = useState('google:gemini-2.5-flash');
  const [modelB, setModelB] = useState('anthropic:claude-3.5-sonnet');

  // Ecosystem input
  const [ecosystemQuery, setEcosystemQuery] = useState('TypeScript state management');

  const priorityOptions = [
    'Cost',
    'Speed',
    'Coding',
    'Context',
    'Reasoning',
    'Vision',
    'Tool Calling',
  ];

  const togglePriority = (p: string) => {
    setSelectedPriorities(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleExecuteResearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (researchType === 'recommendation') {
      const fullPrompt = `${projectDescription}. Priorities: ${selectedPriorities.join(', ')}. Budget: ${budget}. Context: ${contextReq}. ${additionalNotes ? 'Notes: ' + additionalNotes : ''}`.trim();
      if (onNavigateToRecommendations) {
        onNavigateToRecommendations(fullPrompt);
      }
    } else if (researchType === 'library_comparison') {
      onSearch({
        libraryA: libA.trim(),
        libraryB: libB.trim(),
        useCase: libUseCase.trim(),
        options: { includeNews: true, includeVisuals: true }
      });
    } else if (researchType === 'model_comparison') {
      if (onCompareModels) {
        onCompareModels(modelA, modelB);
      } else if (onOpenModelRadar) {
        onOpenModelRadar();
      }
    } else {
      onSearch({
        question: `Explore ecosystem and top modern packages for: ${ecosystemQuery}`,
        libraryA: ecosystemQuery.split(' ')[0] || 'Modern',
        libraryB: ecosystemQuery.split(' ')[1] || 'Alternatives',
        options: { includeNews: true, includeVisuals: false }
      });
    }
  };

  const clickableSuggestions = [
    {
      label: 'Compare React Query vs SWR',
      action: () => {
        setResearchType('library_comparison');
        setLibA('React Query');
        setLibB('SWR');
        onSearch({ libraryA: 'React Query', libraryB: 'SWR', useCase: 'Data fetching & server state', options: { includeNews: true, includeVisuals: true } });
      }
    },
    {
      label: 'Find a model for document analysis',
      action: () => {
        setResearchType('recommendation');
        setProjectDescription('I need a model for analyzing large technical documents, contracts, and PDFs with 1M+ context window.');
        setSelectedPriorities(['Context', 'Reasoning']);
        setContextReq('1M+');
        if (onNavigateToRecommendations) {
          onNavigateToRecommendations('I need a model for analyzing large technical documents and PDFs with 1M+ context window.');
        }
      }
    },
    {
      label: 'Find a low-cost model for a chatbot',
      action: () => {
        setResearchType('recommendation');
        setProjectDescription('I need a cheap, fast model for a high-volume customer-support chatbot with structured output.');
        setSelectedPriorities(['Cost', 'Speed']);
        setBudget('low');
        if (onNavigateToRecommendations) {
          onNavigateToRecommendations('I need a cheap, fast model for a high-volume customer-support chatbot with structured output.');
        }
      }
    },
    {
      label: 'Compare current coding models',
      action: () => {
        setResearchType('recommendation');
        setProjectDescription('I need a model for a coding assistant with strong reasoning, tool calling, and large context.');
        setSelectedPriorities(['Coding', 'Reasoning', 'Tool Calling']);
        if (onNavigateToRecommendations) {
          onNavigateToRecommendations('I need a model for a coding assistant with strong reasoning, tool calling, and large context.');
        }
      }
    },
  ];

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto py-6 sm:py-10">
      {/* 1. HERO TITLE & VALUE PROPOSITION */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EBFF] dark:bg-violet-500/10 border border-[#DDD3FF] dark:border-violet-500/20 text-[#6941D9] dark:text-violet-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />
          <span>Evidence-Based AI Research & Recommendations</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-[#111114] dark:text-[#F5F5F5] leading-[1.1]">
          Research smarter.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D4AFF] to-[#8B72FF]">
            Choose with evidence.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
          Discover current models and libraries, investigate their documentation and ecosystem,
          and get recommendations based on your actual requirements.
        </p>
      </div>

      {/* 2. RESEARCH COMMAND BOX */}
      <div className="rounded-2xl command-box-glass border border-[#E5E7EB] dark:border-white/[0.08] p-5 sm:p-7 shadow-[0_10px_30px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.03)] space-y-5">
        {/* Research Type Selector */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#E5E7EB] dark:border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-semibold mr-2">
            Research Type:
          </span>
          {[
            { id: 'recommendation' as ResearchType, label: 'Find Recommendation' },
            { id: 'library_comparison' as ResearchType, label: 'Library Comparison' },
            { id: 'model_comparison' as ResearchType, label: 'Model Comparison' },
            { id: 'explore_ecosystem' as ResearchType, label: 'Explore Ecosystem' },
          ].map((tab) => {
            const isSelected = researchType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setResearchType(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6D4AFF] text-white shadow-sm font-semibold'
                    : 'bg-[#F8F8FA] dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#111114] hover:bg-[#F1F1F5] dark:hover:text-white border border-[#E5E7EB] dark:border-white/[0.05]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* DYNAMIC FORM BASED ON RESEARCH TYPE */}
        <form onSubmit={handleExecuteResearch} className="space-y-5">
          {/* MODE A: FIND RECOMMENDATION */}
          {researchType === 'recommendation' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                  What are you building?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your use case (e.g. 'I need a model for a coding assistant with strong reasoning')"
                    className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#111114] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10 transition-all font-sans"
                  />
                </div>
              </div>

              {/* What matters most? */}
              <div className="space-y-2">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold">
                  What matters most?
                </span>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((opt) => {
                    const isSelected = selectedPriorities.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => togglePriority(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F2EEFF] text-[#5B3FD6] border border-[#DDD3FF] font-semibold shadow-sm'
                            : 'bg-white dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#111114] dark:hover:text-white border border-[#E5E7EB] dark:border-white/[0.06] hover:bg-[#F8F8FA]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget & Context Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                    Budget
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Low (< $1/1M)' },
                      { id: 'medium', label: 'Medium' },
                      { id: 'flexible', label: 'Flexible' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBudget(b.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                          budget === b.id
                            ? 'bg-[#F2EEFF] text-[#5B3FD6] border border-[#DDD3FF] font-semibold shadow-sm'
                            : 'bg-white dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] border border-[#E5E7EB] dark:border-white/[0.06] hover:bg-[#F8F8FA]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                    Context Requirement
                  </span>
                  <select
                    value={contextReq}
                    onChange={(e) => setContextReq(e.target.value)}
                    className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#111114] dark:text-[#F5F5F5] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                  >
                    <option value="Standard">Standard (32K - 64K)</option>
                    <option value="128K+">128K+ Tokens</option>
                    <option value="200K+">200K+ Tokens</option>
                    <option value="1M+">1,000,000+ Tokens (1M+)</option>
                    <option value="2M+">2,000,000+ Tokens (2M+)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: LIBRARY COMPARISON */}
          {researchType === 'library_comparison' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                    Library A
                  </label>
                  <input
                    type="text"
                    value={libA}
                    onChange={(e) => setLibA(e.target.value)}
                    placeholder="e.g. React Query"
                    className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#111114] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                    Library B
                  </label>
                  <input
                    type="text"
                    value={libB}
                    onChange={(e) => setLibB(e.target.value)}
                    placeholder="e.g. SWR"
                    className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#111114] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                  Target Use Case & Architecture Constraints
                </label>
                <input
                  type="text"
                  value={libUseCase}
                  onChange={(e) => setLibUseCase(e.target.value)}
                  placeholder="e.g. High-throughput microservice or Enterprise dashboard"
                  className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#111114] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>
          )}

          {/* MODE C: MODEL COMPARISON */}
          {researchType === 'model_comparison' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                    Model A
                  </label>
                  <input
                    type="text"
                    value={modelA}
                    onChange={(e) => setModelA(e.target.value)}
                    placeholder="e.g. google:gemini-2.5-flash"
                    className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#111114] dark:text-[#F5F5F5] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                    Model B
                  </label>
                  <input
                    type="text"
                    value={modelB}
                    onChange={(e) => setModelB(e.target.value)}
                    placeholder="e.g. anthropic:claude-3.5-sonnet"
                    className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#111114] dark:text-[#F5F5F5] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE D: EXPLORE ECOSYSTEM */}
          {researchType === 'explore_ecosystem' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#52525B] dark:text-[#71717A] font-semibold mb-1.5">
                  Ecosystem or Domain
                </label>
                <input
                  type="text"
                  value={ecosystemQuery}
                  onChange={(e) => setEcosystemQuery(e.target.value)}
                  placeholder="e.g. TypeScript state management, Rust web frameworks, AI agent SDKs"
                  className="w-full bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#111114] dark:text-[#F5F5F5] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON ROW */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#6D4AFF] hover:bg-[#5B3FD6] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{researchType === 'recommendation' ? 'Research & Recommend' : 'Research'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. CLICKABLE SUGGESTIONS */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
          Try:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {clickableSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-[#F8F8FA] dark:hover:bg-white/[0.08] border border-[#E5E7EB] dark:border-white/[0.06] hover:border-[#DDD3FF] text-xs text-[#52525B] dark:text-[#D4D4D8] hover:text-[#111114] dark:hover:text-white transition-all cursor-pointer shadow-subtle"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. RECOMMENDED FOR YOU PREVIEW SECTION (Section 38) */}
      <div className="space-y-4 pt-4 border-t border-[#E5E7EB] dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6D4AFF]" />
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#111114] dark:text-white">
              Recommended For You
            </h2>
          </div>
          <button
            onClick={() => onNavigateToRecommendations?.()}
            className="text-xs text-[#6D4AFF] dark:text-violet-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Open Recommender Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Model Candidate Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Gemini 2.5 Flash',
              provider: 'Google',
              fit: 'Strong fit for real-time applications & long context (1M tokens).',
              context: '1,000,000 tokens',
              cost: '$0.075 / 1M in',
              evidence: 'Verified provider documentation',
              badges: ['1M Ctx', 'Tool Calling', 'Ultra-Low Latency'],
              onClick: () => onNavigateToRecommendations?.('Gemini 2.5 Flash coding and tool calling')
            },
            {
              name: 'Claude 3.5 Sonnet',
              provider: 'Anthropic',
              fit: 'Exceptional coding benchmarks & complex multi-file reasoning.',
              context: '200,000 tokens',
              cost: '$3.00 / 1M in',
              evidence: 'Verified coding & reasoning benchmarks',
              badges: ['Coding Leader', 'Vision', 'Tool Calling'],
              onClick: () => onNavigateToRecommendations?.('Claude 3.5 Sonnet coding assistant')
            },
            {
              name: 'DeepSeek R1',
              provider: 'DeepSeek',
              fit: 'Top open-weight chain-of-thought reasoning and math synthesis.',
              context: '164,000 tokens',
              cost: '$0.55 / 1M in',
              evidence: 'Official release evaluation documentation',
              badges: ['Deep Reasoning', 'Code', 'Cost-Effective'],
              onClick: () => onNavigateToRecommendations?.('DeepSeek R1 math and reasoning')
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className="p-5 rounded-2xl bg-white dark:bg-[#0C0C0F] border border-[#E5E7EB] dark:border-white/[0.07] hover:border-[#DDD3FF] shadow-subtle hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F0EBFF] text-[#6941D9] font-bold border border-[#DDD3FF]">
                    {item.provider}
                  </span>
                  <span className="text-[10px] text-[#16A34A] font-mono font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    Fresh Evidence
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#111114] dark:text-white font-display group-hover:text-[#6D4AFF] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1 leading-relaxed">
                    {item.fit}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.badges.map((b, bIdx) => (
                    <span
                      key={bIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F8F8FA] dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] border border-[#E5E7EB] dark:border-white/[0.04]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#71717A]">
                  {item.cost}
                </span>
                <span className="text-[#6D4AFF] dark:text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Research</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
