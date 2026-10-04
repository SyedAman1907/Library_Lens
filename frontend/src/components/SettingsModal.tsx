import React from 'react';
import { X, ShieldCheck, Database, Cpu, Search, CheckCircle2, AlertCircle, ExternalLink, Terminal } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, health }) => {
  if (!isOpen) return null;

  const mcpConnected = health?.mcpServer?.connected ?? false;
  const dbType = health?.database?.type ?? 'In-Memory Store (Resilient Fallback)';
  const dbConnected = health?.database?.connected ?? false;
  const serpapiConfigured = health?.integrations?.serpapi ?? false;
  const geminiConfigured = health?.integrations?.gemini ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl workspace-card p-6 border border-slate-200 dark:border-white/[0.1] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                System Architecture & Diagnostics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Model Context Protocol • Evidence Layer • Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4 text-xs">
          <div className="text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider text-[11px] font-semibold">
            Live Service Health
          </div>

          <div className="space-y-2">
            {/* MCP Server */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${mcpConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Python MCP Server</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {health?.mcpServer?.url || 'http://127.0.0.1:5005'}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                mcpConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {mcpConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            {/* SerpApi */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-brand-400" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">SerpApi Search Tools</div>
                  <div className="text-[11px] text-slate-500">
                    Live discovery: `web_search`, `news_search`, `images_search`
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                serpapiConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {serpapiConfigured ? 'KEY ACTIVE' : 'PACKAGE ACTIVE'}
              </span>
            </div>

            {/* Gemini */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-accent-400" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Google Gemini API</div>
                  <div className="text-[11px] text-slate-500">
                    Reasoning & synthesis layer (strictly evidence-bounded)
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                geminiConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {geminiConfigured ? 'READY' : 'STANDBY (RULE ENGINE ACTIVE)'}
              </span>
            </div>

            {/* Storage */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Persistence Store</div>
                  <div className="text-[11px] text-slate-500 font-mono">{dbType}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-950/20 dark:bg-brand-950/30 border border-brand-500/20 text-[11px] text-slate-300 dark:text-brand-200/90 leading-relaxed">
            <strong className="text-white block mb-0.5 font-bold">Evidence Rule: NO SOURCE = NO FACT</strong>
            Gemini is never treated as the source of truth. Factual claims are tied directly to retrieved documentation, package registries, and GitHub release notes.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
