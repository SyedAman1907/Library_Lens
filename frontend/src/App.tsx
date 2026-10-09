import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Hero } from './components/Hero';
import { ResearchProgress } from './components/ResearchProgress';
import { ReportView } from './components/ReportView';
import { HistoryView } from './components/HistoryView';
import { SavedView } from './components/SavedView';
import { LibrariesView } from './components/LibrariesView';
import { SourcesView } from './components/SourcesView';
import { ModelRadar } from './components/ModelRadar';
import { ModelRecommendationView } from './components/ModelRecommendationView';
import { SourceDrawer } from './components/SourceDrawer';
import { SpellingModal } from './components/SpellingModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { AmbientBackground } from './components/AmbientBackground';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { EvidenceGraph } from './components/EvidenceGraph';
import { BreakingChangeRadar } from './components/BreakingChangeRadar';
import { ModelCompareModal } from './components/ModelCompareModal';
import { ModelComparisonView } from './components/ModelComparisonView';
import { ClaimChallengeModal } from './components/ClaimChallengeModal';
import {
  submitResearch,
  fetchResearchById,
  triggerRefreshResearch,
  connectProgressStream,
  checkHealth,
  fetchResearchHistory,
  fetchModelNotifications,
  markModelNotificationRead,
  fetchModels,
} from './services/api';
import {
  ResearchRecord,
  ResearchProgressEvent,
  Source,
  SpellingCandidate,
  ModelNotification,
  AiModelRecord,
  Evidence
} from './types';
import { AlertCircle, X, RefreshCw, Sparkles, Activity } from 'lucide-react';

const SAVED_STORAGE_KEY = 'librarylens_saved_reports';

export function App() {
  const { theme, toggleTheme } = useTheme();

  // Navigation & View state - default to overview homepage
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Recommendations & Comparisons
  const [recommendationPrompt, setRecommendationPrompt] = useState<string>('');
  const [compareModalModels, setCompareModalModels] = useState<{ a?: string; b?: string } | null>(null);
  const [allModels, setAllModels] = useState<AiModelRecord[]>([]);
  const [challengeClaimItem, setChallengeClaimItem] = useState<Evidence | null>(null);

  // Research state
  const [research, setResearch] = useState<ResearchRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial libraries for prefilling research form
  const [initialLibs, setInitialLibs] = useState<{ a: string; b: string }>({
    a: 'React Query',
    b: 'SWR',
  });

  // Live streaming progress events
  const [events, setEvents] = useState<ResearchProgressEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<ResearchProgressEvent | null>(null);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>('');

  // Modal / Drawer states
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [spellingCandidates, setSpellingCandidates] = useState<SpellingCandidate[]>([]);

  // Health / integration status
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Saved reports state (persisted to localStorage)
  const [savedReports, setSavedReports] = useState<ResearchRecord[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // History count for badge
  const [historyCount, setHistoryCount] = useState<number>(0);

  // Model Notifications state
  const [modelNotifications, setModelNotifications] = useState<ModelNotification[]>([]);
  const [activeToastNotification, setActiveToastNotification] = useState<ModelNotification | null>(null);

  useEffect(() => {
    const loadNotifications = () => {
      fetchModelNotifications()
        .then((res) => {
          if (res?.notifications) {
            setModelNotifications(res.notifications);
            const unread = res.notifications.find((n) => !n.read);
            if (unread) {
              setActiveToastNotification(unread);
            }
          }
        })
        .catch(() => {});
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K (Section 27)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load health, initial query params, and history count
  useEffect(() => {
    checkHealth()
      .then((data) => setSystemHealth(data))
      .catch(() => {});

    fetchResearchHistory()
      .then((res) => {
        if (res && res.items) {
          setHistoryCount(res.items.length);
        }
      })
      .catch(() => {});

    fetchModels()
      .then((res) => {
        if (res && res.models) {
          setAllModels(res.models);
        }
      })
      .catch(() => {});

    // Check URL parameters or path for shared research ID (/research/:id or ?id=:id)
    const params = new URLSearchParams(window.location.search);
    let sharedId = params.get('id');
    if (!sharedId && window.location.pathname.startsWith('/research/')) {
      const parts = window.location.pathname.split('/');
      if (parts[2]) {
        sharedId = parts[2];
      }
    }

    if (sharedId) {
      setIsLoading(true);
      setActiveTab('research');
      fetchResearchById(sharedId)
        .then((res) => {
          setResearch(res);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load shared research');
          setIsLoading(false);
        });
    }
  }, []);

  // Save reports persistence
  const handleToggleSaveReport = (record: ResearchRecord) => {
    setSavedReports((prev) => {
      const exists = prev.some((r) => r.id === record.id);
      let updated: ResearchRecord[];
      if (exists) {
        updated = prev.filter((r) => r.id !== record.id);
      } else {
        updated = [record, ...prev];
      }
      try {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedReports((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  const handleStartResearch = async (
    inputOrLibA: string | { question?: string; libraryA?: string; libraryB?: string; useCase?: string; options?: any },
    libB?: string,
    useCase?: string,
    options?: { includeNews: boolean; includeVisuals: boolean }
  ) => {
    setIsLoading(true);
    setError(null);
    setEvents([]);
    setCurrentEvent(null);
    setSpellingCandidates([]);
    setActiveTab('research');

    let questionStr = '';
    if (typeof inputOrLibA === 'object' && inputOrLibA !== null) {
      questionStr = inputOrLibA.question || '';
      if (inputOrLibA.libraryA && inputOrLibA.libraryB) {
        setInitialLibs({ a: inputOrLibA.libraryA, b: inputOrLibA.libraryB });
      }
    } else if (typeof inputOrLibA === 'string' && libB) {
      setInitialLibs({ a: inputOrLibA, b: libB });
    }
    setActiveQuestion(questionStr);

    // Optimistic temporary ID for SSE stream
    const tempId = `res_${Date.now()}`;
    setActiveResearchId(tempId);

    // Connect to real progress event stream
    const disconnectStream = connectProgressStream(
      tempId,
      (ev) => {
        setEvents((prev) => [...prev, ev]);
        setCurrentEvent(ev);
      },
      () => {
        // Stream completed or closed
      }
    );

    try {
      const result = await submitResearch(inputOrLibA, libB, useCase, options);

      // Check if typo suggestions exist
      if (result.suggestions && result.suggestions.length > 0) {
        setSpellingCandidates(result.suggestions);
      }

      setResearch(result);
      setHistoryCount((prev) => prev + 1);

      // Update browser URL query param for easy sharing (/research/:id)
      const newUrl = `/research/${result.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (err: any) {
      setError(err.message || 'Research service temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
      disconnectStream();
    }
  };

  const handleRefreshResearch = async () => {
    if (!research) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const refreshed = await triggerRefreshResearch(research.id);
      setResearch(refreshed);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh research.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetToHero = () => {
    setResearch(null);
    setError(null);
    setActiveTab('overview');
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleLaunchCompare = (libName: string) => {
    const rivals: Record<string, string> = {
      React: 'Vue',
      Vue: 'React',
      'React Query': 'SWR',
      SWR: 'React Query',
      Svelte: 'React',
      Angular: 'React',
      'Next.js': 'Nuxt',
      Nuxt: 'Next.js',
      Remix: 'Next.js',
      Astro: 'Next.js',
      FastAPI: 'Express',
      Express: 'FastAPI',
      Django: 'FastAPI',
      'Spring Boot': 'Quarkus',
      PyTorch: 'TensorFlow',
      TensorFlow: 'PyTorch',
      LangChain: 'LlamaIndex',
      LlamaIndex: 'LangChain',
      Tokio: 'Actix Web',
      'Actix Web': 'Axum',
    };
    const rival = rivals[libName] || 'Alternative';
    setInitialLibs({
      a: libName,
      b: rival,
    });
    setResearch(null);
    handleStartResearch(
      { libraryA: libName, libraryB: rival, useCase: 'Modern production architecture' },
      rival,
      'Modern production architecture',
      { includeNews: true, includeVisuals: true }
    );
  };

  const isCurrentReportSaved = research
    ? savedReports.some((r) => r.id === research.id)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-[#F5F5F5] transition-colors duration-200 relative selection:bg-brand-500/25 selection:text-brand-300">
      {/* Subtle Ambient Background */}
      <AmbientBackground />

      {/* Top Sticky Navigation Bar (Section 6) */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewSearch={handleResetToHero}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setError(null);
        }}
        activeResearchTitle={
          research ? `${research.libraryA} vs ${research.libraryB}` : undefined
        }
        onToggleMobileMenu={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        systemStatus={
          systemHealth
            ? {
                connected: systemHealth.mcpServer?.connected,
                serpapi: systemHealth.integrations?.serpapi,
                gemini: systemHealth.integrations?.gemini,
              }
            : undefined
        }
      />

      {/* Main Workspace Layout (Section 4 & 5) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar (Desktop 240-260px) + Mobile Bottom Nav */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setError(null);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          historyCount={historyCount}
          savedCount={savedReports.length}
          onNewResearch={handleResetToHero}
          theme={theme}
          onToggleTheme={toggleTheme}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          systemStatus={
            systemHealth
              ? {
                  connected: systemHealth.mcpServer?.connected,
                  serpapi: systemHealth.integrations?.serpapi,
                  gemini: systemHealth.integrations?.gemini,
                }
              : undefined
          }
          onScrollToSection={(secId) => {
            const el = document.getElementById(secId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Content Container */}
        <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-8">
          {/* Active Model Release Notification Toast */}
          {activeToastNotification && (
            <div className="bg-gradient-to-r from-violet-900/60 via-purple-900/40 to-black/60 border-b border-violet-500/30 px-4 py-2.5 text-xs text-zinc-200 flex items-center justify-between z-30 relative animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2.5 max-w-3xl truncate">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/30">
                  {activeToastNotification.title}
                </span>
                <span className="truncate text-zinc-300">{activeToastNotification.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('models');
                    markModelNotificationRead(activeToastNotification.id);
                    setActiveToastNotification(null);
                  }}
                  className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3 h-3" />
                  View Model Radar
                </button>
                <button
                  onClick={() => {
                    markModelNotificationRead(activeToastNotification.id);
                    setActiveToastNotification(null);
                  }}
                  className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Error Alert Banner */}
          {error && (
            <div className="max-w-4xl mx-auto mt-6 px-4 w-full animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-[#F5F5F5]">Research Notice</span>
                    <span className="opacity-90">{error}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setError(null);
                      if (research) handleRefreshResearch();
                    }}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                    title="Retry"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Routing based on ActiveTab */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                <Hero
                  onSearch={handleStartResearch}
                  isLoading={isLoading}
                  initialLibA={initialLibs.a}
                  initialLibB={initialLibs.b}
                  onOpenModelRadar={() => setActiveTab('models')}
                  onNavigateToRecommendations={(prompt) => {
                    if (prompt) setRecommendationPrompt(prompt);
                    setActiveTab('recommendations');
                  }}
                  onCompareModels={(mA, mB) => {
                    setCompareModalModels({ a: mA, b: mB });
                    setActiveTab('comparisons');
                  }}
                  onNavigateToComparisons={() => setActiveTab('comparisons')}
                />
              </div>
            )}

            {activeTab === 'research' && (
              <>
                {isLoading ? (
                  <div className="py-12 px-4 max-w-4xl mx-auto w-full">
                    <ResearchProgress
                      libraryA={research?.libraryA || initialLibs.a}
                      libraryB={research?.libraryB || initialLibs.b}
                      question={activeQuestion || research?.question}
                      events={events}
                      currentEvent={currentEvent}
                    />
                  </div>
                ) : research ? (
                  <ReportView
                    research={research}
                    onRefresh={handleRefreshResearch}
                    isRefreshing={isRefreshing}
                    onSelectSource={(source) => setSelectedSource(source)}
                    isSaved={isCurrentReportSaved}
                    onToggleSave={() => handleToggleSaveReport(research)}
                    onNavigateToRecommendations={(req) => {
                      if (req) setRecommendationPrompt(req);
                      setActiveTab('recommendations');
                    }}
                    onNavigateToComparisons={() => setActiveTab('comparisons')}
                  />
                ) : (
                  <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Hero
                      onSearch={handleStartResearch}
                      isLoading={isLoading}
                      initialLibA={initialLibs.a}
                      initialLibB={initialLibs.b}
                      onOpenModelRadar={() => setActiveTab('models')}
                      onNavigateToRecommendations={(prompt) => {
                        if (prompt) setRecommendationPrompt(prompt);
                        setActiveTab('recommendations');
                      }}
                      onCompareModels={(mA, mB) => {
                        setCompareModalModels({ a: mA, b: mB });
                        setActiveTab('comparisons');
                      }}
                      onNavigateToComparisons={() => setActiveTab('comparisons')}
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 'recommendations' && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                <ModelRecommendationView
                  initialPrompt={recommendationPrompt}
                  onNavigateToRadar={() => setActiveTab('models')}
                  onSelectModel={(m) => {
                    setCompareModalModels({ a: m.id });
                    setActiveTab('comparisons');
                  }}
                />
              </div>
            )}

            {activeTab === 'comparisons' && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                <ModelComparisonView
                  allModels={allModels}
                  initialModelA={compareModalModels?.a || 'google:gemini-2.5-flash'}
                  initialModelB={compareModalModels?.b || 'anthropic:claude-3.5-sonnet'}
                  onSelectSource={(source) => setSelectedSource(source)}
                />
              </div>
            )}

            {activeTab === 'models' && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                <ModelRadar />
              </div>
            )}

            {activeTab === 'libraries' && (
              <LibrariesView onCompareWith={handleLaunchCompare} />
            )}

            {activeTab === 'evidence-graph' && (
              <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
                <EvidenceGraph
                  evidence={research?.evidence || []}
                  sources={research?.sources || []}
                  onSelectSource={(source) => setSelectedSource(source)}
                  onChallengeClaim={(claim) => setChallengeClaimItem(claim)}
                />
              </div>
            )}

            {activeTab === 'release-radar' && (
              <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
                <BreakingChangeRadar
                  breakingChanges={research?.report?.breakingChanges || []}
                  sources={research?.sources || []}
                  onSelectSource={(source) => setSelectedSource(source)}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <HistoryView
                onSelectResearch={(record) => {
                  setResearch(record);
                  setActiveTab('research');
                }}
                onNewResearch={handleResetToHero}
              />
            )}

            {activeTab === 'saved' && (
              <SavedView
                savedItems={savedReports}
                onSelectResearch={(record) => {
                  setResearch(record);
                  setActiveTab('research');
                }}
                onRemoveSaved={handleRemoveSaved}
                onNewResearch={handleResetToHero}
              />
            )}

            {activeTab === 'sources' && (
              <SourcesView
                research={research}
                onSelectSource={(source) => setSelectedSource(source)}
                onNewResearch={handleResetToHero}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Command Palette (⌘K / Ctrl+K - Section 27) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewResearch={handleResetToHero}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setError(null);
        }}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickCompare={(libA, libB, uc) => {
          handleStartResearch(
            { libraryA: libA, libraryB: libB, useCase: uc || '' },
            libB,
            uc || '',
            { includeNews: true, includeVisuals: true }
          );
        }}
        onRefresh={research ? handleRefreshResearch : undefined}
        isResearchActive={Boolean(research)}
      />

      {/* Side-by-Side Model Comparison Modal */}
      {compareModalModels && (
        <ModelCompareModal
          initialModelA={compareModalModels.a}
          initialModelB={compareModalModels.b}
          modelsList={allModels}
          onClose={() => setCompareModalModels(null)}
        />
      )}

      {/* Claim Challenge Audit Modal */}
      {challengeClaimItem && (
        <ClaimChallengeModal
          isOpen={Boolean(challengeClaimItem)}
          onClose={() => setChallengeClaimItem(null)}
          researchId={research?.id || 'res_general'}
          claim={challengeClaimItem}
        />
      )}

      {/* Slide-out Source Detail Drawer Modal */}
      <SourceDrawer
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
      />

      {/* Intelligent Spelling Suggestion Modal */}
      <SpellingModal
        candidates={spellingCandidates}
        onConfirm={(chosenA, chosenB) => {
          setSpellingCandidates([]);
          if (chosenA && chosenB) {
            handleStartResearch(chosenA, chosenB, '', {
              includeNews: true,
              includeVisuals: true,
            });
          }
        }}
        onDismiss={() => setSpellingCandidates([])}
      />

      {/* System Architecture & Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        health={systemHealth}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
