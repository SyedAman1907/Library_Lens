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
  Compass,
  ArrowRightLeft,
  FileCheck2,
  Scale,
  Database,
  Award
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
  onNavigateToComparisons?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  isLoading,
  initialLibA = 'React Query',
  initialLibB = 'SWR',
  onOpenModelRadar,
  onNavigateToRecommendations,
  onCompareModels,
  onNavigateToComparisons,
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
  const [modelA, setModelA] = useState('google:gemini-3.8-flash');
  const [modelB, setModelB] = useState('anthropic:claude-3-5-sonnet');

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
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto py-4 sm:py-8">
      {/* 1. HERO TITLE & VALUE PROPOSITION */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] dark:bg-red-500/10 border border-[#FECDD3] dark:border-red-500/20 text-[#E63946] dark:text-red-400 text-xs font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse" />
          <span>AI RESEARCH + RECOMMENDATION</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-[#241414] dark:text-[#F5F5F5] leading-[1.12]">
          Research smarter.<br />
          <span className="text-[#E63946]">
            Choose with evidence.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
          LibraryLens investigates current documentation, releases, ecosystem information, and other evidence to recommend the options that best fit your requirements.
        </p>

        {/* Hero Primary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToRecommendations) {
                onNavigateToRecommendations();
              } else {
                setResearchType('recommendation');
              }
            }}
            className="btn-primary-red flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>✦ Find My Best Option →</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onNavigateToComparisons) {
                onNavigateToComparisons();
              } else {
                setResearchType('library_comparison');
              }
            }}
            className="btn-secondary-neutral flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-white/[0.05] hover:bg-[#FDF9F7] dark:hover:bg-white/[0.08] text-[#241414] dark:text-white border border-[#F0DED7] dark:border-white/[0.1] shadow-subtle transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#71717A]" />
            <span>Compare Libraries</span>
          </button>
        </div>

        {/* Compact Trust Line */}
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-[#71717A] dark:text-[#A1A1AA]">
          <span>Current ecosystem data</span>
          <span>•</span>
          <span>Evidence-backed research</span>
          <span>•</span>
          <span>Source-linked recommendations</span>
        </div>
      </div>

      {/* 2. RESEARCH COMMAND BOX WITH SIGNATURE ACCENT */}
      <div className="rounded-2xl bg-white dark:bg-[#100D0D] border border-[#F0DED7] dark:border-white/[0.08] p-5 sm:p-7 shadow-[0_10px_30px_rgba(36,20,20,0.04),0_2px_8px_rgba(36,20,20,0.02)] space-y-5 relative overflow-hidden">
        {/* Signature Accent Top Bar */}
        <div className="signature-accent-bar absolute top-0 left-0 right-0 h-1" />

        {/* Research Type Selector */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#F0DED7] dark:border-white/[0.06] pt-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-semibold mr-2">
            Research Type:
          </span>
          {[
            { id: 'recommendation' as ResearchType, label: '✦ Find Recommendation' },
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
                    ? 'bg-[#E63946] text-white shadow-xs font-semibold'
                    : 'bg-[#FFFDF9] dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#241414] hover:bg-[#FDF9F7] dark:hover:text-white border border-[#F0DED7] dark:border-white/[0.05]'
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
                    className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#241414] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10 transition-all font-sans"
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
                            ? 'bg-[#FFF1F2] text-[#E63946] border border-[#FECDD3] font-semibold shadow-xs'
                            : 'bg-white dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#241414] dark:hover:text-white border border-[#F0DED7] dark:border-white/[0.06] hover:bg-[#FFFDF9]'
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
                            ? 'bg-[#FFF1F2] text-[#E63946] border border-[#FECDD3] font-semibold shadow-xs'
                            : 'bg-white dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] border border-[#F0DED7] dark:border-white/[0.06] hover:bg-[#FFFDF9]'
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
                    className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#241414] dark:text-[#F5F5F5] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
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
                    className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#241414] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
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
                    className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#241414] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
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
                  className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#241414] dark:text-[#F5F5F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
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
                    placeholder="e.g. google:gemini-3.8-flash"
                    className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#241414] dark:text-[#F5F5F5] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
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
                    placeholder="e.g. anthropic:claude-3-5-sonnet"
                    className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#241414] dark:text-[#F5F5F5] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
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
                  className="w-full bg-[#FFFDF9] dark:bg-[#141010] border border-[#F0DED7] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#241414] dark:text-[#F5F5F5] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-500/10"
                />
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON ROW */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary-red flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{researchType === 'recommendation' ? '✦ Research & Recommend' : 'Research'}</span>
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
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-[#FFFDF9] dark:hover:bg-white/[0.08] border border-[#F0DED7] dark:border-white/[0.06] hover:border-[#FECDD3] text-xs text-[#52525B] dark:text-[#D4D4D8] hover:text-[#241414] dark:hover:text-white transition-all cursor-pointer shadow-subtle"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. THE 4 CORE PRINCIPLES (HOW IT WORKS & ANSWERS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-[#F0DED7] dark:border-white/[0.06] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] dark:bg-red-500/10 text-[#E63946] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#241414] dark:text-white">
            1. What is LibraryLens?
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            An AI research engine that investigates developer ecosystems and recommends best-fit technologies.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-[#F0DED7] dark:border-white/[0.06] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] dark:bg-pink-500/10 text-[#EC4899] flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#241414] dark:text-white">
            2. How does it decide?
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Matches your explicit architecture requirements against verified facts, benchmarks, and maintenance metrics.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-[#F0DED7] dark:border-white/[0.06] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FEFCE8] dark:bg-yellow-500/10 text-[#D4A017] flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#241414] dark:text-white">
            3. Where is evidence from?
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Live documentation, GitHub repos, npm registries, release notes, and empirical test results.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-[#F0DED7] dark:border-white/[0.06] space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] dark:bg-amber-500/10 text-[#B45309] flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#241414] dark:text-white">
            4. What do you get?
          </h3>
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            A verified ✦ LIBRARYLENS PICK, confidence scoring, citation trail, and transparent trade-offs.
          </p>
        </div>
      </div>

      {/* 5. RECOMMENDED FOR YOU PREVIEW SECTION */}
      <div className="space-y-4 pt-4 border-t border-[#F0DED7] dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E63946]" />
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#241414] dark:text-white">
              Recommended For You
            </h2>
          </div>
          <button
            onClick={() => onNavigateToRecommendations?.()}
            className="text-xs text-[#E63946] dark:text-red-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Open Recommender Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Model Candidate Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Gemini 3.8 Flash',
              provider: 'Google',
              fit: 'Top recommendation for real-time applications & massive context (1M+ tokens).',
              context: '1,000,000 tokens',
              cost: '$0.075 / 1M in',
              isPick: true,
              badges: ['1M Ctx', 'Tool Calling', 'Ultra-Low Latency'],
              onClick: () => onNavigateToRecommendations?.('Gemini 3.8 Flash coding and tool calling')
            },
            {
              name: 'Claude 3.5 Sonnet',
              provider: 'Anthropic',
              fit: 'Exceptional coding benchmarks & complex multi-file architectural reasoning.',
              context: '200,000 tokens',
              cost: '$3.00 / 1M in',
              isPick: false,
              badges: ['Coding Leader', 'Vision', 'Tool Calling'],
              onClick: () => onNavigateToRecommendations?.('Claude 3.5 Sonnet coding assistant')
            },
            {
              name: 'DeepSeek R1',
              provider: 'DeepSeek',
              fit: 'Top open-weight chain-of-thought reasoning, math, and code synthesis.',
              context: '164,000 tokens',
              cost: '$0.55 / 1M in',
              isPick: false,
              badges: ['Deep Reasoning', 'Code', 'Cost-Effective'],
              onClick: () => onNavigateToRecommendations?.('DeepSeek R1 math and reasoning')
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className={`p-5 rounded-2xl bg-white dark:bg-[#100D0D] border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-subtle hover:shadow-md ${
                item.isPick
                  ? 'border-[#D4A017] dark:border-[#D4A017]/60'
                  : 'border-[#F0DED7] dark:border-white/[0.07] hover:border-[#FECDD3]'
              }`}
            >
              {item.isPick && (
                <div className="signature-accent-bar absolute top-0 left-0 right-0 h-1" />
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.isPick ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FEFCE8] text-[#92400E] font-extrabold border border-[#FDE047]">
                        ✦ LIBRARYLENS PICK
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF1F2] text-[#E63946] font-bold border border-[#FECDD3]">
                        {item.provider}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Fresh Evidence
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#241414] dark:text-white font-display group-hover:text-[#E63946] transition-colors">
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
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFFDF9] dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] border border-[#F0DED7] dark:border-white/[0.04]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0DED7] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#71717A]">
                  {item.cost}
                </span>
                <span className="text-[#E63946] dark:text-red-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
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
