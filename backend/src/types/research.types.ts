export type SourceTier = 1 | 2 | 3 | 4;

export type SourceType =
  | 'official_docs'
  | 'official_release'
  | 'github'
  | 'npm'
  | 'pypi'
  | 'crates'
  | 'maven'
  | 'news'
  | 'community'
  | 'image'
  | 'web';

export interface Source {
  id: string; // e.g. "src_001"
  title: string;
  url: string;
  sourceType: SourceType;
  tier: SourceTier;
  publisher: string;
  library: string;
  claim?: string;
  snippet: string;
  publishedAt: string | null;
  retrievedAt: string;
  confidence: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  rightsNotice?: string;
}

export type ClaimVerificationState =
  | 'VERIFIED'
  | 'PARTIALLY VERIFIED'
  | 'UNVERIFIED'
  | 'CONFLICTING EVIDENCE';

export interface Evidence {
  id: string;
  claim: string;
  sourceIds: string[];
  library: string;
  confidence: number;
  verified: boolean;
  verificationState?: ClaimVerificationState;
  unverifiedReason?: string;
}

export interface ReleaseInfo {
  library: string;
  version: string;
  releaseDate: string | null;
  changelogUrl?: string;
  sourceId: string;
  summary?: string;
  isPrerelease?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  publishedAt: string | null;
  retrievedAt: string;
  snippet: string;
  url: string;
  thumbnailUrl?: string | null;
  library: string;
  officialConfirmationSourceId?: string | null;
  officialConfirmationUrl?: string | null;
  isOfficiallyConfirmed: boolean;
}

export interface FeatureComparisonRow {
  category: string;
  libraryA: string;
  libraryB: string;
  sourceIds: string[];
  confidence: number;
}

export interface BreakingChangeItem {
  library: string;
  affectedVersion: string;
  description: string;
  impact?: 'High' | 'Medium' | 'Low';
  migrationRequired?: boolean;
  migrationGuidance: string;
  sourceId: string;
  sourceUrl?: string;
  officialSource?: string;
}

export interface MigrationStep {
  step: number;
  title: string;
  details: string;
  codeSnippet?: string;
}

export interface ApiDifference {
  category: string;
  fromApi: string;
  toApi: string;
  notes: string;
}

export interface DependencyChange {
  package: string;
  action: 'add' | 'remove' | 'update';
  reason: string;
}

export interface MigrationGuide {
  fromLibrary: string;
  toLibrary: string;
  currentVersion?: string;
  targetVersion?: string;
  projectType?: string;
  overview: string;
  potentialBreakingChanges?: string[];
  migrationSteps?: MigrationStep[];
  apiDifferences?: ApiDifference[];
  dependencyChanges?: DependencyChange[];
  testingChecklist?: string[];
  rollbackConsiderations?: string[];
  considerations: Array<{
    area: string;
    details: string;
    sourceIds: string[];
  }>;
  officialMigrationSourceId?: string;
  officialMigrationUrl?: string;
  isAiGeneratedGuide?: boolean;
}

export interface LibraryVersionData {
  name: string;
  ecosystem: string;
  currentVersion: string;
  releaseDate: string | null;
  packageUrl: string;
  repoUrl?: string;
  homepageUrl?: string;
  documentationUrl?: string;
  sourceIds: string[];
  description?: string;
  license?: string;
  downloadsWeekly?: number;
  githubStars?: number;
  openIssues?: number;
}

export interface VisualReference {
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceDomain?: string;
  rightsNotice: string;
}

export interface ResearchTransparency {
  searchesPerformed: string[];
  toolsUsed: string[];
  totalSourcesExamined: number;
  officialSourcesFound: number;
  newsSourcesFound: number;
  visualReferencesFound: number;
  verifiedClaimsCount: number;
  researchDurationMs: number;
  lastUpdated: string;
}

export interface ComparisonReport {
  summary: string;
  versionData: {
    libraryA: LibraryVersionData;
    libraryB: LibraryVersionData;
  };
  featureMatrix: FeatureComparisonRow[];
  recentReleases: ReleaseInfo[];
  recentDevelopments: NewsItem[];
  breakingChanges: BreakingChangeItem[];
  migration: MigrationGuide;
  typeScriptSupport: {
    libraryA: { level: string; details: string; sourceIds: string[] };
    libraryB: { level: string; details: string; sourceIds: string[] };
  };
  ecosystemAnalysis: {
    libraryA: { tooling: string[]; stateOfEcosystem: string; sourceIds: string[] };
    libraryB: { tooling: string[]; stateOfEcosystem: string; sourceIds: string[] };
  };
  useCaseAnalysis: {
    useCase: string;
    considerations: Array<{
      factor: string;
      analysisA: string;
      analysisB: string;
      sourceIds: string[];
    }>;
    tradeoffsSummary: string;
  };
  visualReferences: VisualReference[];
  researchTransparency: ResearchTransparency;
}

export interface QuestionAnalysis {
  originalQuestion: string;
  identifiedLibraries: string[];
  useCase: string;
  intent: 'comparison' | 'migration' | 'safety_evaluation' | 'general_research';
  detectedEcosystems?: string[];
}

export interface ClaimChallengeResult {
  claimId: string;
  originalClaim: string;
  library: string;
  verificationState: ClaimVerificationState;
  confidence: number;
  supportingEvidence: Array<{
    title: string;
    url: string;
    publisher: string;
    tier: number;
    snippet: string;
  }>;
  contradictoryEvidence: Array<{
    title: string;
    url: string;
    publisher: string;
    tier: number;
    snippet: string;
  }>;
  synthesis: string;
  challengedAt: string;
}

export interface ReportVersion {
  versionNumber: number;
  createdAt: string;
  summary: string;
  report: ComparisonReport;
  diff?: {
    addedSourcesCount: number;
    removedSourcesCount?: number;
    newReleasesCount: number;
    updatedClaimsCount: number;
    changedVersions?: {
      libraryA?: { from: string; to: string };
      libraryB?: { from: string; to: string };
    };
    changedVerificationStatus?: Array<{ claimId: string; from: string; to: string }>;
  };
}

export interface ReplayEvent {
  step: string;
  message: string;
  progressPercent: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface ResearchPlanTask {
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
  tasks: ResearchPlanTask[];
  includeNews: boolean;
  includeVisuals: boolean;
}

export interface SpellingCandidate {
  input: string;
  suggested: string;
  ecosystem: string;
  confidence: number;
}

export interface UseCaseScenarioInput {
  projectType: string;
  teamSize?: string;
  experienceLevel?: string;
  deploymentEnvironment?: string;
  performanceRequirements?: string;
  ecosystemRequirements?: string;
  migrationConstraints?: string;
  existingTechnology?: string;
}

export interface UseCaseScenarioAnalysis {
  scenarioTitle: string;
  factors: Array<{
    factor: string;
    relevance: string;
    tradeoffA: string;
    tradeoffB: string;
    recommendationNote: string;
  }>;
  architecturalConsiderations: string[];
  caveats: string[];
}

export type FreshnessCategory = 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';

export interface FreshnessInfo {
  category: FreshnessCategory;
  retrievedText: string;
  publishedText: string | null;
  ageDays: number | null;
  ttlSeconds: number;
  isStale: boolean;
  lastResearchedAt: string;
  lastVerifiedAt: string;
}

export interface ResearchRecord {
  id: string;
  question?: string;
  questionAnalysis?: QuestionAnalysis;
  researchPlan?: ResearchPlan;
  suggestions?: SpellingCandidate[];
  libraryA: string;
  libraryB: string;
  useCase: string;
  options?: {
    includeNews?: boolean;
    includeVisuals?: boolean;
    forceRefresh?: boolean;
  };
  status: 'pending' | 'researching' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  lastResearchedAt?: string;
  lastVerifiedAt?: string;
  currentVersionNumber?: number;
  sources: Source[];
  evidence: Evidence[];
  report?: ComparisonReport;
  versions?: ReportVersion[];
  replayEvents?: ReplayEvent[];
  challenges?: Record<string, ClaimChallengeResult>;
  useCaseScenario?: UseCaseScenarioAnalysis;
}

export interface ResearchProgressEvent {
  researchId: string;
  step: string;
  message: string;
  progressPercent: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

