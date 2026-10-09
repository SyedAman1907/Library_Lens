import React, { useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Home,
  Activity,
  Boxes,
  Layers,
  Radio,
  Clock,
  Bookmark,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';

export type ActiveTab =
  | 'overview'
  | 'recommendations'
  | 'models'
  | 'comparisons'
  | 'research'
  | 'libraries'
  | 'evidence-graph'
  | 'release-radar'
  | 'history'
  | 'saved'
  | 'sources'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  historyCount: number;
  savedCount: number;
  onNewResearch: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  systemStatus?: {
    connected?: boolean;
    serpapi?: boolean;
    gemini?: boolean;
  };
  onScrollToSection?: (sectionId: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
  historyCount,
  savedCount,
  onNewResearch,
  theme,
  onToggleTheme,
  systemStatus,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative select-none ${
      isActive
        ? 'bg-[#FFF1F2] text-[#E63946] dark:bg-red-500/15 dark:text-red-300 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-sm before:bg-[#E63946]'
        : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#241414] dark:hover:text-[#F5F5F5] hover:bg-[#FDF9F7] dark:hover:bg-white/[0.04]'
    } ${isCollapsed ? 'justify-center px-0 before:hidden' : ''}`;

  const renderNavLinks = (isDrawer = false) => (
    <div className="space-y-6">
      {/* Top Brand Header in Sidebar */}
      {(!isCollapsed || isDrawer) && (
        <div className="px-2 pb-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#E63946] font-bold text-sm">◉</span>
            <span className="font-display font-bold text-xs tracking-tight text-[#241414] dark:text-[#F5F5F5]">
              LibraryLens
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#71717A] block mt-0.5">
            Research Intelligence
          </span>
        </div>
      )}

      {/* New Research Action Button */}
      <button
        onClick={() => {
          onNewResearch();
          if (isDrawer && onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/[0.04] hover:bg-[#FFF1F2] dark:hover:bg-white/[0.08] text-[#241414] dark:text-white border border-[#F0DED7] dark:border-white/[0.1] hover:border-[#FECDD3] transition-all cursor-pointer shadow-subtle ${
          isCollapsed && !isDrawer ? 'justify-center px-0' : ''
        }`}
        title="Start New Research"
      >
        <Plus className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
        {(!isCollapsed || isDrawer) && <span>New Research</span>}
      </button>

      {/* SECTION 1: WORKSPACE */}
      <div className="space-y-1">
        {(!isCollapsed || isDrawer) && (
          <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
            Workspace
          </h3>
        )}
        <nav className="space-y-0.5">
          <button
            onClick={() => {
              onSelectTab('overview');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'overview')}
            title="Overview Homepage"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Home
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'overview' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Overview</span>}
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('recommendations');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative select-none ${
              activeTab === 'recommendations'
                ? 'bg-[#FDF2F8] text-[#EC4899] dark:bg-pink-500/20 dark:text-pink-300 font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-sm before:bg-[#EC4899]'
                : 'text-[#EC4899] dark:text-pink-400 hover:bg-[#FDF2F8]/60 dark:hover:bg-pink-500/10 font-semibold'
            } ${isCollapsed && !isDrawer ? 'justify-center px-0 before:hidden' : ''}`}
            title="Personalized AI Model & Library Recommendations"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#EC4899] dark:text-pink-400" />
              {(!isCollapsed || isDrawer) && <span className="truncate font-semibold">✦ AI Recommender</span>}
            </div>
            {(!isCollapsed || isDrawer) && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EC4899] text-white shadow-xs">
                HERO
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('research');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'research')}
            title="Active Research Session"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Flame
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'research' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Active Research</span>}
            </div>
          </button>
        </nav>
      </div>

      {/* SECTION 2: INTELLIGENCE */}
      <div className="space-y-1">
        {(!isCollapsed || isDrawer) && (
          <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
            Intelligence
          </h3>
        )}
        <nav className="space-y-0.5">
          <button
            onClick={() => {
              onSelectTab('models');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'models')}
            title="AI Model Radar"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Activity
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'models' ? 'text-[#D4A017] dark:text-amber-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Model Radar</span>}
            </div>
            {(!isCollapsed || isDrawer) && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FEFCE8] text-[#92400E] border border-[#FDE047]">
                RADAR
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('comparisons');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'comparisons')}
            title="Model Comparison Engine (Evidence-Backed)"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ArrowRightLeft
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'comparisons' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Model Comparison</span>}
            </div>
            {(!isCollapsed || isDrawer) && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FFF1F2] text-[#E63946] border border-[#FECDD3]">
                VS
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('libraries');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'libraries')}
            title="Supported Libraries Directory"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Boxes
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'libraries' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Library Compare</span>}
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('evidence-graph');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'evidence-graph')}
            title="Evidence-to-Source Verification Graph"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'evidence-graph' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Evidence Graph</span>}
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('release-radar');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'release-radar')}
            title="Breaking Change & Deprecation Radar"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Radio
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'release-radar' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Release Radar</span>}
            </div>
          </button>
        </nav>
      </div>

      {/* SECTION 3: ARCHIVES & SOURCES */}
      <div className="space-y-1">
        {(!isCollapsed || isDrawer) && (
          <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
            Archives
          </h3>
        )}
        <nav className="space-y-0.5">
          <button
            onClick={() => {
              onSelectTab('history');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'history')}
            title="Research History"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'history' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">History</span>}
            </div>
            {(!isCollapsed || isDrawer) && historyCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FFFDF9] dark:bg-white/[0.06] text-[#71717A] border border-[#F0DED7] dark:border-transparent">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('saved');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'saved')}
            title="Saved Research Reports"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Bookmark
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'saved' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Saved</span>}
            </div>
            {(!isCollapsed || isDrawer) && savedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FFF1F2] dark:bg-red-500/20 text-[#E63946] dark:text-red-300 font-bold border border-[#FECDD3]">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('sources');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={navItemClass(activeTab === 'sources')}
            title="All Verified Sources"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BookOpen
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'sources' ? 'text-[#E63946] dark:text-red-400' : 'text-[#71717A]'
                }`}
              />
              {(!isCollapsed || isDrawer) && <span className="truncate">Sources</span>}
            </div>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (240–260px) */}
      <aside
        className={`hidden md:flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 border-r border-[#F0DED7] dark:border-white/[0.07] bg-[#FFFDF9] dark:bg-[#100D0D] text-[#52525B] dark:text-[#A1A1AA] transition-all duration-200 z-30 select-none ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {renderNavLinks(false)}
        </div>

        {/* Desktop Sidebar Bottom Utilities */}
        <div className="p-3 border-t border-[#F0DED7] dark:border-white/[0.06] space-y-2 bg-[#FFFDF9] dark:bg-[#100D0D]">
          {/* Settings / Diagnostics Button */}
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#FDF9F7] dark:hover:bg-white/[0.04] text-[#52525B] hover:text-[#241414] dark:hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="System Diagnostics & Settings"
          >
            <Settings className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            {!isCollapsed && <span>Diagnostics</span>}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-1.5 rounded-lg text-[#71717A] hover:text-[#241414] dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04] border border-transparent hover:border-[#F0DED7] dark:hover:border-white/[0.07] transition-all cursor-pointer text-xs"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-1.5 text-[11px]">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Slide-out Drawer (< 768px) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fadeIn">
          {/* Semi-transparent Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* 280px Slide-out Container */}
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-[#FFFDF9] dark:bg-[#100D0D] border-r border-[#F0DED7] dark:border-white/[0.08] shadow-2xl flex flex-col justify-between z-50 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Header with Close X */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F0DED7] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#E63946] text-white flex items-center justify-center font-bold text-xs">
                    ◉
                  </div>
                  <span className="font-display font-bold text-sm text-[#241414] dark:text-white">
                    Library<span className="text-[#E63946]">Lens</span>
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-[#71717A] hover:text-[#241414] dark:hover:text-white hover:bg-[#FDF9F7] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderNavLinks(true)}
            </div>

            <div className="pt-4 border-t border-[#F0DED7] dark:border-white/[0.06]">
              <button
                onClick={() => {
                  onOpenSettings();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-white dark:bg-white/[0.04] border border-[#F0DED7] text-[#241414] dark:text-white"
              >
                <Settings className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Diagnostics & API Status</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#100D0D]/95 backdrop-blur-xl border-t border-[#F0DED7] dark:border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'overview' ? 'text-[#E63946] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab('research')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'research' ? 'text-[#E63946] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Research</span>
        </button>

        <button
          onClick={() => onSelectTab('recommendations')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'recommendations' ? 'text-[#EC4899] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#EC4899]" />
          <span>✦ AI</span>
        </button>

        <button
          onClick={() => onSelectTab('models')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'models' ? 'text-[#D4A017] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Activity className="w-4 h-4 text-[#D4A017]" />
          <span>Radar</span>
        </button>

        <button
          onClick={() => onSelectTab('comparisons')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'comparisons' ? 'text-[#E63946] font-bold' : 'text-[#71717A]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-[#E63946]" />
          <span>Compare</span>
        </button>
      </nav>
    </>
  );
};
