import React from 'react';
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
  Flame
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';

export type ActiveTab =
  | 'overview'
  | 'recommendations'
  | 'models'
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
}) => {
  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative select-none ${
      isActive
        ? 'bg-[#F2EEFF] text-[#5B3FD6] dark:bg-violet-500/15 dark:text-violet-300 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-sm before:bg-[#6D4AFF]'
        : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F5F5F5] hover:bg-[#F6F6F8] dark:hover:bg-white/[0.04]'
    } ${isCollapsed ? 'justify-center px-0 before:hidden' : ''}`;

  return (
    <>
      {/* Desktop Sidebar (240–260px) */}
      <aside
        className={`hidden md:flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 border-r border-[#E5E7EB] dark:border-white/[0.07] bg-white dark:bg-[#08080A] text-[#52525B] dark:text-[#A1A1AA] transition-all duration-200 z-30 select-none ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Top Brand Header in Sidebar */}
          {!isCollapsed && (
            <div className="px-2 pb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[#6D4AFF] font-bold text-sm">◉</span>
                <span className="font-display font-bold text-xs tracking-tight text-[#111114] dark:text-[#F5F5F5]">
                  LibraryLens
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#71717A] block mt-0.5">
                Research Intelligence
              </span>
            </div>
          )}

          {/* New Research Action Button (Section 8: Outlined white button with violet plus) */}
          <button
            onClick={onNewResearch}
            className={`w-full flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/[0.04] hover:bg-[#F7F5FF] dark:hover:bg-white/[0.08] text-[#111114] dark:text-white border border-[#D9DCE3] dark:border-white/[0.1] hover:border-[#C9BEFF] dark:hover:border-violet-500/40 transition-all cursor-pointer shadow-subtle ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Start New Research"
          >
            <Plus className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
            {!isCollapsed && <span>New Research</span>}
          </button>

          {/* SECTION 1: WORKSPACE (Section 10) */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
                Workspace
              </h3>
            )}
            <nav className="space-y-0.5">
              <button
                onClick={() => onSelectTab('overview')}
                className={navItemClass(activeTab === 'overview')}
                title="Overview Homepage"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Home
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'overview' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Overview</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectTab('recommendations')}
                className={navItemClass(activeTab === 'recommendations')}
                title="Personalized AI Model Recommendations"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'recommendations' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Recommendations</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F0EBFF] text-[#6941D9] border border-[#DDD3FF] dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25">
                    AI
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('research')}
                className={navItemClass(activeTab === 'research')}
                title="Active Research Session"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Flame
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'research' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Active Research</span>}
                </div>
              </button>
            </nav>
          </div>

          {/* SECTION 2: INTELLIGENCE */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
                Intelligence
              </h3>
            )}
            <nav className="space-y-0.5">
              <button
                onClick={() => onSelectTab('models')}
                className={navItemClass(activeTab === 'models')}
                title="AI Model Radar"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Activity
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'models' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Model Radar</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F0EBFF] text-[#6941D9] border border-[#DDD3FF] dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25">
                    RADAR
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('libraries')}
                className={navItemClass(activeTab === 'libraries')}
                title="Supported Libraries Directory"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Boxes
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'libraries' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Library Compare</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectTab('evidence-graph')}
                className={navItemClass(activeTab === 'evidence-graph')}
                title="Evidence-to-Source Verification Graph"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Layers
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'evidence-graph' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Evidence Graph</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectTab('release-radar')}
                className={navItemClass(activeTab === 'release-radar')}
                title="Breaking Changes & Release Radar"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Radio
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'release-radar' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Release Radar</span>}
                </div>
              </button>
            </nav>
          </div>

          {/* SECTION 3: RESEARCH HISTORY & SOURCES */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
                Research
              </h3>
            )}
            <nav className="space-y-0.5">
              <button
                onClick={() => onSelectTab('history')}
                className={navItemClass(activeTab === 'history')}
                title="Research History"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'history' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Research History</span>}
                </div>
                {!isCollapsed && historyCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F1F1F5] dark:bg-white/[0.06] text-[#71717A]">
                    {historyCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('saved')}
                className={navItemClass(activeTab === 'saved')}
                title="Saved Research"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bookmark
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'saved' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Saved Research</span>}
                </div>
                {!isCollapsed && savedCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F1F1F5] dark:bg-white/[0.06] text-[#71717A]">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('sources')}
                className={navItemClass(activeTab === 'sources')}
                title="Verification Sources Center"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'sources' ? 'text-[#6D4AFF] dark:text-violet-400' : 'text-[#71717A]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">Sources</span>}
                </div>
              </button>
            </nav>
          </div>

          {/* SECTION 4: SYSTEM */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold tracking-[0.12em] text-[#A1A1AA] uppercase mb-1.5 font-mono">
                System
              </h3>
            )}
            <nav className="space-y-0.5">
              <button
                onClick={onOpenSettings}
                className={navItemClass(activeTab === 'settings')}
                title="System Architecture & MCP Settings"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  {!isCollapsed && <span className="truncate">Settings</span>}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* BOTTOM SIDEBAR STATUS (Section 12: White surface, green status, subtle border) */}
        <div className="p-3 border-t border-[#E5E7EB] dark:border-white/[0.07] bg-[#FAFAFC] dark:bg-[#0A0A0D] space-y-2">
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.07] shadow-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-medium text-[#111114] dark:text-[#E4E4E7] truncate">
                  Live Verification
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
                ONLINE
              </span>
            </div>
          )}

          {/* Settings & Theme toggle below status (Section 12) */}
          <div className="space-y-0.5 pt-0.5">
            <button
              onClick={onOpenSettings}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04] border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/[0.07] transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="System Diagnostics & Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </button>

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04] border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/[0.07] transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Toggle Theme (Light / Dark)"
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                {!isCollapsed && <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>}
              </button>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-1.5 rounded-lg text-[#71717A] hover:text-[#111114] dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04] border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/[0.07] transition-all cursor-pointer text-xs"
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-[#E5E7EB] dark:border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'overview' ? 'text-[#6D4AFF] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onSelectTab('recommendations')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'recommendations' ? 'text-[#6D4AFF] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recommend</span>
        </button>

        <button
          onClick={() => onSelectTab('models')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'models' ? 'text-[#6D4AFF] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Radar</span>
        </button>

        <button
          onClick={() => onSelectTab('evidence-graph')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'evidence-graph' ? 'text-[#6D4AFF] font-bold' : 'text-[#71717A]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Evidence</span>
        </button>

        <button
          onClick={() => onSelectTab('sources')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] ${
            activeTab === 'sources' ? 'text-[#6D4AFF] font-bold' : 'text-[#71717A]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sources</span>
        </button>
      </nav>
    </>
  );
};
