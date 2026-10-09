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

export interface HighLevelPlanAction {
  step: number;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
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
  actions?: HighLevelPlanAction[];
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

// ==========================================
// AI Model Intelligence & Radar Types
// ==========================================

export type ModelCapability =
  | 'Text'
  | 'Vision'
  | 'Audio'
  | 'Video'
  | 'Image Generation'
  | 'Code'
  | 'Reasoning'
  | 'Tool Calling'
  | 'Function Calling'
  | 'Structured Output'
  | 'Embeddings'
  | 'Streaming'
  | 'Long Context'
  | 'Multilingual';

export type ModelStatus =
  | 'ACTIVE'
  | 'NEW'
  | 'UPDATED'
  | 'DEPRECATED'
  | 'RETIRED'
  | 'UNKNOWN'
  | 'MISSING_FROM_LATEST_SYNC';

export type ModelFreshness = 'Fresh' | 'Aging' | 'Stale' | 'Unknown';

export type ModelResearchStatus = 'not_started' | 'pending' | 'researching' | 'completed' | 'failed';

export interface ModelEvidence {
  id: string;
  claim: string;
  sourceUrl: string;
  sourceTitle: string;
  tier: number;
  verified: boolean;
  retrievedAt: string;
  snippet?: string;
  verificationState?: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED' | 'CONFLICTING EVIDENCE';
}

export interface ModelHistoryItem {
  id: string;
  timestamp: string;
  changeType: 'DISCOVERED' | 'METADATA_UPDATED' | 'RESEARCH_COMPLETED' | 'STATUS_CHANGED' | 'DEPRECATED';
  field?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  sourceUrl?: string;
}

export interface AiModelRecord {
  id: string;
  provider: string;
  modelId: string;
  displayName: string;
  family?: string;
  version?: string;
  aliases: string[];
  description: string;
  capabilities: ModelCapability[];
  modalities: {
    input: string[];
    output: string[];
  };
  contextWindow: number | null;
  maxOutputTokens: number | null;
  inputPricing: number | null;
  outputPricing: number | null;
  releaseDate: string | null;
  knowledgeCutoff: string | null;
  status: ModelStatus;
  documentationUrl: string | null;
  apiUrl: string | null;
  sourceUrl: string | null;
  repositoryUrl: string | null;
  official: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  lastCheckedAt: string;
  lastResearchedAt: string | null;
  researchStatus: ModelResearchStatus;
  freshness: ModelFreshness;
  metadata: Record<string, any>;
  evidence: ModelEvidence[];
  history: ModelHistoryItem[];
  researchSummary?: string;
  overview?: string;
  strengths?: string[];
  limitations?: string[];
}

export interface ProviderHealth {
  provider: string;
  displayName: string;
  enabled: boolean;
  status: 'connected' | 'disabled' | 'error';
  modelCount: number;
  lastCheckedAt: string | null;
  errorMessage?: string;
}

export interface ModelRadarStats {
  totalTracked: number;
  newCount: number;
  updatedCount: number;
  activeCount: number;
  deprecatedCount: number;
  recentlyResearchedCount: number;
  lastSynchronizedAt: string | null;
  isSyncInProgress: boolean;
  providers: ProviderHealth[];
}

export interface ModelNotification {
  id: string;
  type: 'NEW_MODEL' | 'MODEL_UPDATED' | 'MODEL_DEPRECATED';
  title: string;
  message: string;
  provider: string;
  modelId: string;
  timestamp: string;
  read: boolean;
}

export interface ModelSyncProgress {
  stage: 'idle' | 'discovering' | 'detecting_changes' | 'researching' | 'completed' | 'error';
  currentProvider?: string;
  modelsDiscovered: number;
  newModelsDetected: number;
  updatedModelsDetected: number;
  deprecatedModelsDetected: number;
  researchedCount: number;
  totalToResearch: number;
  message: string;
  startedAt: string | null;
  completedAt: string | null;
  error?: string;
}

export interface ModelComparisonRelease {
  model: string;
  version: string;
  date: string;
  notes: string;
  url?: string;
}

export interface ModelComparisonRecommendation {
  recommendedModel: string | null;
  recommendedModelId: string | null;
  isBothViable: boolean;
  title: string;
  why: string[];
  tradeoff: string;
  viableFactors?: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LIMITED';
}

export interface ModelComparisonSource {
  id: string;
  title: string;
  url: string;
  sourceType: string;
  publisher: string;
  tier: number;
  retrievedAt: string;
  snippet?: string;
}

export interface ModelComparisonEvidence {
  id: string;
  claim: string;
  verified: boolean;
  verificationState: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED' | 'CONFLICTING EVIDENCE';
  sourceIds: string[];
  model: string;
}

export interface ModelComparisonResult {
  modelA: AiModelRecord;
  modelB: AiModelRecord;
  lastResearchedAt?: string;
  requirements?: string;
  overview?: {
    modelA: string;
    modelB: string;
    summary: string;
  };
  capabilities?: {
    shared: string[];
    onlyInA: string[];
    onlyInB: string[];
  };
  context?: {
    contextA: number | null;
    contextB: number | null;
    maxOutputA: number | null;
    maxOutputB: number | null;
    ratio: string | null;
    analysis: string;
  };
  pricing?: {
    inputA: number | null;
    inputB: number | null;
    outputA: number | null;
    outputB: number | null;
    analysis: string;
  };
  performance?: {
    latencyA: string;
    latencyB: string;
    throughputA: string;
    throughputB: string;
    analysis: string;
  };
  toolCalling?: {
    modelA: string;
    modelB: string;
    supportedA: boolean;
    supportedB: boolean;
    analysis: string;
  };
  vision?: {
    modelA: string;
    modelB: string;
    supportedA: boolean;
    supportedB: boolean;
    analysis: string;
  };
  coding?: {
    modelA: string;
    modelB: string;
    analysis: string;
  };
  availability?: {
    modelA: string;
    modelB: string;
    analysis: string;
  };
  ecosystem?: {
    modelA: string;
    modelB: string;
    analysis: string;
  };
  releases?: ModelComparisonRelease[];
  tradeoffs?: {
    whenToChooseA: string[];
    whenToChooseB: string[];
    summary: string;
  };
  recommendation?: ModelComparisonRecommendation;
  evidence?: ModelComparisonEvidence[];
  sources?: ModelComparisonSource[];
  // Backwards compatibility for previous simple UI
  comparison: {
    contextRatio: string | null;
    sharedCapabilities: string[];
    onlyInA: string[];
    onlyInB: string[];
    pricingComparison: {
      inputA: number | null;
      inputB: number | null;
      outputA: number | null;
      outputB: number | null;
    };
  };
}

export interface ExtractedRequirements {
  useCase: string;
  budget?: 'low' | 'medium' | 'high' | 'unconstrained';
  maxInputPricePerMillion?: number | null;
  minContextWindow?: number | null;
  latencyPriority?: 'ultra_low' | 'low' | 'standard';
  capabilitiesRequired: ModelCapability[];
  toolCallingRequired?: boolean;
  structuredOutputRequired?: boolean;
  visionRequired?: boolean;
  audioRequired?: boolean;
  reasoningRequired?: boolean;
  codeRequired?: boolean;
  scale?: string;
  deployment?: string;
  ecosystem?: string;
  privacy?: string;
  notes?: string;
}

export interface UserRequirementInput {
  prompt: string;
  constraints?: Partial<ExtractedRequirements>;
}

export interface RequirementEvidenceItem {
  requirement: string;
  evidenceClaim: string;
  sourceTitle: string;
  sourceUrl: string;
  tier: number;
  relevance: string;
  retrievedAt: string;
  verified: boolean;
}

export interface RequirementExplanationItem {
  requirement: string;
  evidence: string;
  relevance: string;
  tradeOff: string;
  sourceTitle: string;
  sourceUrl: string;
  tier: number;
  retrievedAt: string;
  verificationStatus: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED';
}

export interface ModelRecommendationCandidate {
  model: AiModelRecord;
  suitabilityScore: number; // 0 - 100
  isTopPick: boolean;
  whyItFits: string[];
  tradeOffs: string[];
  factorStatus: Record<string, 'satisfied' | 'partial' | 'unmet' | 'unknown'>;
  evidenceList: RequirementEvidenceItem[];
  requirementExplanations: RequirementExplanationItem[];
}

export interface MatrixRow {
  factor: string;
  values: Record<string, '✓' | '○' | '✗' | '—'>;
}

export interface CounterSourceItem {
  title: string;
  url: string;
  snippet?: string;
  relevance: string;
}

export interface ChallengeHistoryItem {
  timestamp: string;
  findings: string;
  changes: string;
  counterSources: CounterSourceItem[];
}

export interface RecommendationAnalysis {
  id: string;
  userPrompt: string;
  detectedRequirements: ExtractedRequirements;
  relevantFactors: string[];
  confidence: 'High' | 'Medium' | 'Limited';
  confidenceReason: string;
  recommendations: ModelRecommendationCandidate[];
  comparisonMatrix: {
    factors: string[];
    models: Array<{
      id: string;
      modelId: string;
      displayName: string;
      provider: string;
    }>;
    rows: MatrixRow[];
  };
  createdAt: string;
  updatedAt: string;
  challengedAt?: string;
  challengeHistory?: ChallengeHistoryItem[];
  refreshedAt?: string;
  refreshDetails?: {
    previousTopModelId?: string;
    newTopModelId?: string;
    hasChanges: boolean;
    reasonForUpdate: string;
    sourcesRefreshed: number;
    refreshedAt: string;
  };
}

export interface SavedUseCase {
  id: string;
  name: string;
  prompt: string;
  requirements: ExtractedRequirements;
  currentRecommendedModelIds: string[];
  researchHistory?: Array<{
    timestamp: string;
    note: string;
    candidateModelIds: string[];
  }>;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedUseCaseMatchAlert {
  id: string;
  useCaseId: string;
  useCaseName: string;
  modelId: string;
  modelDisplayName: string;
  provider: string;
  reason: string;
  matchedCapabilities: string[];
  detectedAt: string;
}


