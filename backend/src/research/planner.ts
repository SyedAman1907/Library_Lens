export interface HighLevelPlanAction {
  step: number;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
}

export interface ResearchTask {
  id: string;
  type: 'doc_search' | 'release_search' | 'breaking_changes' | 'migration' | 'news' | 'visuals';
  library: string;
  query: string;
  priority: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ResearchPlan {
  libraryA: string;
  libraryB: string;
  useCase: string;
  actions: HighLevelPlanAction[];
  tasks: ResearchTask[];
  includeNews: boolean;
  includeVisuals: boolean;
}

export function createResearchPlan(
  libraryA: string,
  libraryB: string,
  useCase: string,
  options?: { includeNews?: boolean; includeVisuals?: boolean }
): ResearchPlan {
  const includeNews = options?.includeNews ?? true;
  // Automatically activate visuals if user mentions architecture/diagrams, or explicitly opted in
  const isArchitectureRequested = /architecture|diagram|structure|visual|system design/i.test(useCase);
  const includeVisuals = options?.includeVisuals ?? isArchitectureRequested;

  const tasks: ResearchTask[] = [];

  const addLibraryTasks = (lib: string) => {
    // 1. Official Documentation & Overview
    tasks.push({
      id: `task_doc_${lib.toLowerCase()}`,
      type: 'doc_search',
      library: lib,
      query: `${lib} official documentation`,
      priority: 1
    });

    // 2. Latest Release & Changelog
    tasks.push({
      id: `task_rel_${lib.toLowerCase()}`,
      type: 'release_search',
      library: lib,
      query: `${lib} latest release notes changelog`,
      priority: 1
    });

    // 3. Breaking changes
    tasks.push({
      id: `task_breaking_${lib.toLowerCase()}`,
      type: 'breaking_changes',
      library: lib,
      query: `${lib} breaking changes major release`,
      priority: 2
    });

    // 4. Migration considerations
    tasks.push({
      id: `task_migration_${lib.toLowerCase()}`,
      type: 'migration',
      library: lib,
      query: `${lib} migration guide upgrade`,
      priority: 2
    });

    // 5. News / Recent developments (if enabled)
    if (includeNews) {
      tasks.push({
        id: `task_news_${lib.toLowerCase()}`,
        type: 'news',
        library: lib,
        query: `${lib} latest release announcement`,
        priority: 3
      });
    }

    // 6. Visual / Architecture diagrams (if enabled)
    if (includeVisuals) {
      tasks.push({
        id: `task_visual_${lib.toLowerCase()}`,
        type: 'visuals',
        library: lib,
        query: `${lib} architecture diagram official`,
        priority: 4
      });
    }
  };

  addLibraryTasks(libraryA);
  addLibraryTasks(libraryB);

  // Cross-library comparison search for specific use case context
  if (useCase && useCase.trim().length > 0) {
    tasks.push({
      id: 'task_usecase_context',
      type: 'doc_search',
      library: `${libraryA} and ${libraryB}`,
      query: `${libraryA} vs ${libraryB} ${useCase.slice(0, 60)}`,
      priority: 3
    });
  }

  const actions: HighLevelPlanAction[] = [
    { step: 1, label: 'Identify current versions', status: 'pending' },
    { step: 2, label: 'Check official documentation', status: 'pending' },
    { step: 3, label: 'Check latest releases', status: 'pending' },
    { step: 4, label: 'Check breaking changes', status: 'pending' },
    { step: 5, label: 'Check migration documentation', status: 'pending' },
    { step: 6, label: 'Check GitHub', status: 'pending' },
    { step: 7, label: 'Check package registry', status: 'pending' },
    { step: 8, label: 'Search recent developments', status: 'pending' },
    { step: 9, label: 'Cross-check important claims', status: 'pending' },
    { step: 10, label: 'Generate evidence-backed report', status: 'pending' },
  ];

  return {
    libraryA,
    libraryB,
    useCase,
    actions,
    tasks,
    includeNews,
    includeVisuals
  };
}
