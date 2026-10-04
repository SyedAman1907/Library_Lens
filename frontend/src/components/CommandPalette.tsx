import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Clock,
  Bookmark,
  Boxes,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Zap,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  ArrowRight,
  Terminal,
  ExternalLink,
  X,
  Activity
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewResearch: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onQuickCompare: (libA: string, libB: string, useCase?: string) => void;
  onRefresh?: () => void;
  isResearchActive?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewResearch,
  onSelectTab,
  onToggleTheme,
  onOpenSettings,
  onQuickCompare,
  onRefresh,
  isResearchActive,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  const commandItems = [
    {
      id: 'new-research',
      category: 'Research Actions',
      title: 'New Research Inquiry',
      subtitle: 'Start an evidence-backed autonomous research workflow',
      icon: Plus,
      badge: 'Cmd+N',
      action: () => {
        onNewResearch();
        onClose();
      },
    },
    {
      id: 'demo-mode',
      category: 'Research Actions',
      title: '⚡ Run Hackathon Live Demo',
      subtitle: 'React vs Vue for production dashboard (60-90s pipeline)',
      icon: Zap,
      badge: 'Live Demo',
      action: () => {
        onQuickCompare('React', 'Vue', 'Building a large production dashboard');
        onClose();
      },
    },
    ...(isResearchActive && onRefresh
      ? [
          {
            id: 'refresh-research',
            category: 'Research Actions',
            title: 'Refresh Current Research',
            subtitle: 'Revalidate stale evidence, releases, and claims',
            icon: RefreshCw,
            badge: 'Live Search',
            action: () => {
              onRefresh();
              onClose();
            },
          },
        ]
      : []),
    {
      id: 'tab-history',
      category: 'Navigation',
      title: 'Open Research History',
      subtitle: 'Browse all previously executed verified reports',
      icon: Clock,
      badge: 'History',
      action: () => {
        onSelectTab('history');
        onClose();
      },
    },
    {
      id: 'tab-models',
      category: 'Navigation',
      title: 'AI Model Radar & Live Discovery',
      subtitle: 'Track new model releases, pricing, context windows, and empirical specs',
      icon: Activity,
      badge: 'Radar',
      action: () => {
        onSelectTab('models');
        onClose();
      },
    },
    {
      id: 'tab-saved',
      category: 'Navigation',
      title: 'Open Saved Research',
      subtitle: 'Quick access to bookmarked technical reports',
      icon: Bookmark,
      badge: 'Saved',
      action: () => {
        onSelectTab('saved');
        onClose();
      },
    },
    {
      id: 'tab-libraries',
      category: 'Navigation',
      title: 'Explore Popular Libraries',
      subtitle: 'Browse npm, PyPI, Maven, crates.io, NuGet frameworks',
      icon: Boxes,
      badge: 'Directory',
      action: () => {
        onSelectTab('libraries');
        onClose();
      },
    },
    {
      id: 'tab-sources',
      category: 'Navigation',
      title: 'Open Evidence Source Explorer',
      subtitle: 'Inspect primary Tier 1 documentation and registry records',
      icon: BookOpen,
      badge: 'Sources',
      action: () => {
        onSelectTab('sources');
        onClose();
      },
    },
    {
      id: 'action-theme',
      category: 'Preferences',
      title: 'Toggle Theme',
      subtitle: 'Switch between dark-first and clean light mode',
      icon: Sun,
      badge: 'Appearance',
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'action-settings',
      category: 'Preferences',
      title: 'System Diagnostics & MCP Health',
      subtitle: 'Inspect SerpApi, Gemini, MongoDB and tool connection status',
      icon: Settings,
      badge: 'Diagnostics',
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
    // Quick Pre-configured Comparison Commands
    {
      id: 'compare-express-fastapi',
      category: 'Quick Comparisons',
      title: 'Express vs FastAPI',
      subtitle: 'Node.js vs Python high-performance async API migration',
      icon: ArrowRight,
      badge: 'Quick Compare',
      action: () => {
        onQuickCompare('Express', 'FastAPI', 'High performance REST API backend');
        onClose();
      },
    },
    {
      id: 'compare-next-nuxt',
      category: 'Quick Comparisons',
      title: 'Next.js vs Nuxt',
      subtitle: 'React vs Vue full-stack SSR frameworks',
      icon: ArrowRight,
      badge: 'Quick Compare',
      action: () => {
        onQuickCompare('Next.js', 'Nuxt', 'Full-stack enterprise web portal');
        onClose();
      },
    },
    {
      id: 'compare-tokio-actix',
      category: 'Quick Comparisons',
      title: 'Tokio vs Actix Web',
      subtitle: 'Rust async runtime vs high-throughput web server',
      icon: ArrowRight,
      badge: 'Rust Ecosystem',
      action: () => {
        onQuickCompare('Tokio', 'Actix Web', 'High-concurrency network service');
        onClose();
      },
    },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0A0A0B] text-[#F5F5F5] border border-white/[0.1] rounded-2xl shadow-elevated overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#0A0A0B]">
          <Search className="w-4 h-4 text-[#71717A] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search libraries, releases, sources..."
            className="w-full bg-transparent text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none font-medium"
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#A1A1AA] border border-white/[0.08]">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/[0.08] text-[#71717A] hover:text-[#F5F5F5] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#71717A] text-xs">
              No matching commands or inquiries found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/15 text-[#F5F5F5] border border-brand-500/30 shadow-subtle'
                      : 'hover:bg-white/[0.04] text-[#A1A1AA]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-brand-500 text-white'
                          : 'bg-white/[0.06] text-[#A1A1AA]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F5F5F5] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#71717A]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A1A1AA] border border-white/[0.08] shrink-0 ml-2">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#050505] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">NO SOURCE = NO FACT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
