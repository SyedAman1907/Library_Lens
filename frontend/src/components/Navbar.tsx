import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Settings,
  Sparkles,
  Command,
  Activity,
  ChevronRight,
  Bell,
  User,
  CheckCircle2,
  ExternalLink,
  Check
} from 'lucide-react';
import { ThemeMode, ActiveTheme } from '../hooks/useTheme';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  theme: ActiveTheme;
  mode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme: () => void;
  onNewSearch: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeResearchTitle?: string;
  systemStatus?: {
    connected?: boolean;
    serpapi?: boolean;
    gemini?: boolean;
  };
  notificationCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  mode = 'light',
  onSetThemeMode,
  onToggleTheme,
  onNewSearch,
  onOpenSettings,
  onOpenCommandPalette,
  activeTab,
  onSelectTab,
  activeResearchTitle,
  systemStatus,
  notificationCount = 0,
  onOpenNotifications,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'recommendations':
        return 'Recommendations';
      case 'models':
        return 'Model Radar';
      case 'research':
        return 'Active Research';
      case 'libraries':
        return 'Library Compare';
      case 'evidence-graph':
        return 'Evidence Graph';
      case 'release-radar':
        return 'Release Radar';
      case 'history':
        return 'Research History';
      case 'saved':
        return 'Saved Research';
      case 'sources':
        return 'Sources';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-[#08080A]/95 border-b border-[#E5E7EB] dark:border-white/[0.08] transition-colors select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* LEFT: Logo & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo with clean black text + violet AI badge (Section 5) */}
          <div
            onClick={onNewSearch}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#6D4AFF] text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="font-bold font-mono text-white text-xs">◉</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-tight text-[#111114] dark:text-[#F5F5F5]">
                Library<span className="text-[#6D4AFF] dark:text-violet-400">Lens</span>
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F0EBFF] text-[#6941D9] border border-[#DDD3FF] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30">
                AI
              </span>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="hidden sm:block h-4 w-px bg-[#E5E7EB] dark:bg-white/[0.08] shrink-0" />

          {/* Breadcrumb Path */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#52525B] dark:text-[#71717A] truncate">
            <span
              onClick={onNewSearch}
              className="hover:text-[#111114] dark:hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              Workspace
            </span>
            <ChevronRight className="w-3 h-3 text-[#A1A1AA] shrink-0" />
            <span className="text-[#111114] dark:text-[#A1A1AA] font-semibold capitalize truncate">
              {activeResearchTitle ? activeResearchTitle : getBreadcrumbLabel(activeTab)}
            </span>
          </div>
        </div>

        {/* CENTER: Global Search Bar with Ctrl/Cmd + K (Section 5) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#F5F5F7] dark:bg-[#0C0C0F] hover:bg-[#EAEAEF] dark:hover:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.07] focus:border-[#6D4AFF] text-xs text-[#52525B] dark:text-[#71717A] transition-all cursor-pointer group shadow-subtle"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#111114] dark:group-hover:text-[#A1A1AA] transition-colors" />
              <span className="group-hover:text-[#111114] dark:group-hover:text-[#A1A1AA] transition-colors truncate">
                Search models, libraries, research...
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-[#71717A] px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.04] border border-[#E5E7EB] dark:border-white/[0.06] shadow-sm">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* RIGHT: MCP Status, Theme, Notifications, Settings, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-1.5 rounded-lg text-[#52525B] hover:text-[#111114] dark:hover:text-[#F5F5F5] hover:bg-[#F1F1F5] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* MCP Server Status Pill (Section 6: white/light surface, subtle border, green dot & badge) */}
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0C0C0F] border border-[#E5E7EB] dark:border-white/[0.07] hover:border-emerald-500/40 text-[11px] font-mono cursor-pointer transition-colors shadow-subtle"
            title="Inspect Live MCP Server & Integration Status"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#52525B] dark:text-[#A1A1AA] hidden lg:inline font-medium">
              MCP Server Active
            </span>
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
              Live
            </span>
          </div>

          {/* Theme Dropdown Menu (Section 32: Light / Dark / System) */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-1.5 rounded-lg text-[#52525B] hover:text-[#111114] dark:text-[#A1A1AA] dark:hover:text-white hover:bg-[#F1F1F5] dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/[0.08]"
              title="Theme settings (Light / Dark / System)"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-violet-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.08] shadow-xl p-1.5 z-50 text-xs animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                  Theme
                </div>
                {[
                  { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
                  { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                  { id: 'system' as ThemeMode, label: 'System', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onSetThemeMode) onSetThemeMode(item.id);
                        else onToggleTheme();
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2EEFF] text-[#5B3FD6] dark:bg-violet-500/20 dark:text-violet-300 font-semibold'
                          : 'text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#F6F6F8] dark:hover:bg-white/[0.04] hover:text-[#111114] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-[#6D4AFF]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications || onOpenSettings}
            className="relative p-1.5 rounded-lg text-[#52525B] hover:text-[#111114] dark:text-[#A1A1AA] dark:hover:text-white hover:bg-[#F1F1F5] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#6D4AFF]" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-[#52525B] hover:text-[#111114] dark:text-[#A1A1AA] dark:hover:text-white hover:bg-[#F1F1F5] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="System Diagnostics & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F2EEFF] dark:bg-violet-950/40 border border-[#DDD3FF] dark:border-violet-500/30 text-[#6D4AFF] dark:text-violet-300 text-xs font-semibold hover:border-[#6D4AFF] transition-colors cursor-pointer shadow-subtle"
              title="User Profile"
            >
              <User className="w-3.5 h-3.5" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.08] shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                <div className="px-2.5 py-1.5 border-b border-[#E5E7EB] dark:border-white/[0.06] mb-1">
                  <span className="font-semibold block text-[#111114] dark:text-white">Principal Engineer</span>
                  <span className="text-[10px] text-[#71717A] font-mono">judge@librarylens.ai</span>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F6F6F8] dark:hover:bg-white/[0.04] text-[#52525B] hover:text-[#111114] dark:text-[#A1A1AA] dark:hover:text-white transition-colors"
                >
                  Settings & API Keys
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSelectTab('saved');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F6F6F8] dark:hover:bg-white/[0.04] text-[#52525B] hover:text-[#111114] dark:text-[#A1A1AA] dark:hover:text-white transition-colors"
                >
                  Saved Research
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
