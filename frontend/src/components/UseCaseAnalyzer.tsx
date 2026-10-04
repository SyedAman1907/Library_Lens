import React, { useState } from 'react';
import { Source } from '../types';
import { CitationBadge } from './CitationBadge';
import { Sliders, ShieldCheck, Scale, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface UseCaseAnalyzerProps {
  libraryA: string;
  libraryB: string;
  initialUseCase: string;
  sources: Source[];
  onSelectSource: (source: Source) => void;
}

export const UseCaseAnalyzer: React.FC<UseCaseAnalyzerProps> = ({
  libraryA,
  libraryB,
  initialUseCase,
  sources,
  onSelectSource,
}) => {
  const [projectType, setProjectType] = useState('Enterprise Dashboard');
  const [teamSize, setTeamSize] = useState('Mid-size (4-12 devs)');
  const [experienceLevel, setExperienceLevel] = useState('Senior / Experienced');
  const [deploymentEnv, setDeploymentEnv] = useState('Cloud / Kubernetes');
  const [performanceReq, setPerformanceReq] = useState('High Throughput / Low Latency');

  // Compute scenario-relevant factors dynamically
  const scenarioFactors = [
    {
      factor: 'State & Rendering Architecture',
      relevance: `Crucial for ${projectType} with ${teamSize}`,
      analysisA: `${libraryA} relies on its idiomatic lifecycle model and broad ecosystem libraries. Fits teams with existing convention knowledge.`,
      analysisB: `${libraryB} utilizes high-ergonomic primitives and official tooling pipelines. Reduces boilerplate for rapid onboarding.`,
      consideration: 'Evaluate whether fine-grained reactivity or unidirectional data flow aligns closer with your state complexity.'
    },
    {
      factor: 'Team Velocity & Ergonomics',
      relevance: `Tailored for ${experienceLevel} teams`,
      analysisA: `${libraryA} has vast community consensus, countless production blueprints, and extensive third-party package ecosystem.`,
      analysisB: `${libraryB} features first-party guidance and opinionated official modules (router, state, devtools), minimizing configuration drift.`,
      consideration: 'Weigh third-party ecosystem breadth against first-party coherence.'
    },
    {
      factor: 'Runtime Footprint & Deployment Envelope',
      relevance: `Configured for ${deploymentEnv} (${performanceReq})`,
      analysisA: `${libraryA} offers predictable memory footprints and broad runtime compatibility across Node, Bun, and Edge runtimes.`,
      analysisB: `${libraryB} provides optimized compilation targets and lightweight bundles with minimal cold-start overhead.`,
      consideration: 'Measure real cold-start metrics and bundle sizes against your specific target platform.'
    }
  ];

  return (
    <div className="workspace-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-500 font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Scenario Simulator & Trade-off Analyzer</span>
          </div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Use-Case Analyzer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customize your engineering constraints to evaluate factors relevant to your scenario.
          </p>
        </div>

        {/* Objective Decision Badge (No Winner Guarantee) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold self-start sm:self-auto border border-indigo-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>No Universal Winner • Objective Trade-offs</span>
        </div>
      </div>

      {/* Interactive Scenario Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl workspace-card-subtle text-xs">
        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
            Project Type
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full command-input py-1.5 px-2.5 text-xs rounded-lg"
          >
            <option>Enterprise Dashboard</option>
            <option>High-Throughput Microservice</option>
            <option>Real-Time Collaborative App</option>
            <option>Public High-SEO Web Platform</option>
            <option>Internal DevOps Tool</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
            Team Size & Structure
          </label>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="w-full command-input py-1.5 px-2.5 text-xs rounded-lg"
          >
            <option>Solo Engineer / Startup (1-3 devs)</option>
            <option>Mid-size Team (4-12 devs)</option>
            <option>Large Enterprise (15+ devs)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
            Team Experience
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full command-input py-1.5 px-2.5 text-xs rounded-lg"
          >
            <option>Junior / Broad Background</option>
            <option>Senior / Experienced</option>
            <option>Specialized Systems Engineers</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
            Deployment Environment
          </label>
          <select
            value={deploymentEnv}
            onChange={(e) => setDeploymentEnv(e.target.value)}
            className="w-full command-input py-1.5 px-2.5 text-xs rounded-lg"
          >
            <option>Cloud / Kubernetes</option>
            <option>Serverless / Edge Runtimes</option>
            <option>Single Dedicated VM</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
            Performance Priority
          </label>
          <select
            value={performanceReq}
            onChange={(e) => setPerformanceReq(e.target.value)}
            className="w-full command-input py-1.5 px-2.5 text-xs rounded-lg"
          >
            <option>High Throughput / Low Latency</option>
            <option>Standard Web Ergonomics</option>
            <option>Ultra-low Memory Footprint</option>
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <div className="text-[10px] font-mono text-slate-400 pb-1">Context Alignment</div>
          <div className="p-1.5 rounded bg-slate-200/50 dark:bg-white/[0.04] text-[11px] font-mono text-slate-600 dark:text-slate-300">
            {projectType} • {deploymentEnv}
          </div>
        </div>
      </div>

      {/* Factors Relevant To Your Scenario */}
      <div className="space-y-4">
        <h4 className="font-mono text-xs uppercase font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Factors Relevant to Your Stated Scenario</span>
        </h4>

        <div className="space-y-3">
          {scenarioFactors.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl workspace-card-subtle space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {item.factor}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.relevance}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04]">
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 block mb-1 font-bold uppercase">
                    {libraryA} Considerations
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {item.analysisA}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04]">
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block mb-1 font-bold uppercase">
                    {libraryB} Considerations
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {item.analysisB}
                  </p>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                <span className="font-bold text-indigo-500">Architecture Decision Rule:</span>
                <span>{item.consideration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neutrality Policy Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <strong className="text-slate-900 dark:text-white block mb-0.5">Strict Neutrality Policy:</strong>
        LibraryLens AI never declares a generic winner or computes arbitrary 1-10 scores. Software architecture choices are contextual trade-offs based on maintainability, team ergonomics, ecosystem gravity, and operational risk.
      </div>
    </div>
  );
};
