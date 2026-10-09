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
  tier: number; // 1 = Official doc, 2 = Official announcement, 3 = Catalog, 4 = GitHub, 5 = Registry, 6 = Tech news, 7 = Community
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

export interface DiscoveredModel {
  provider: string;
  modelId: string;
  displayName: string;
  family?: string;
  version?: string;
  aliases?: string[];
  description?: string;
  capabilities: ModelCapability[];
  modalities?: {
    input: string[];
    output: string[];
  };
  contextWindow: number | null;
  maxOutputTokens: number | null;
  inputPricing: number | null; // e.g. USD per 1M tokens or null
  outputPricing: number | null; // e.g. USD per 1M tokens or null
  releaseDate: string | null;
  knowledgeCutoff: string | null;
  status: ModelStatus;
  documentationUrl: string | null;
  apiUrl: string | null;
  sourceUrl: string | null;
  repositoryUrl: string | null;
  official: boolean;
  raw?: Record<string, any>;
}

export interface AiModelRecord {
  id: string; // e.g. "google:gemini-1.5-pro"
  provider: string; // "google" | "openai" | "anthropic" | ...
  modelId: string; // "gemini-1.5-pro"
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

export interface ModelChangeRecord {
  modelId: string;
  provider: string;
  field: string;
  oldValue: any;
  newValue: any;
  detectedAt: string;
  source: string;
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

export interface ModelProviderAdapter {
  readonly providerName: string;
  readonly displayName: string;
  isEnabled(): boolean;
  healthCheck(): Promise<ProviderHealth>;
  listModels(): Promise<DiscoveredModel[]>;
  getModelDetails?(modelId: string): Promise<DiscoveredModel | null>;
  normalizeModel(rawModel: any): DiscoveredModel;
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
  lastResearchedAt: string;
  requirements?: string;
  overview: {
    modelA: string;
    modelB: string;
    summary: string;
  };
  capabilities: {
    shared: string[];
    onlyInA: string[];
    onlyInB: string[];
  };
  context: {
    contextA: number | null;
    contextB: number | null;
    maxOutputA: number | null;
    maxOutputB: number | null;
    ratio: string | null;
    analysis: string;
  };
  pricing: {
    inputA: number | null;
    inputB: number | null;
    outputA: number | null;
    outputB: number | null;
    analysis: string;
  };
  performance: {
    latencyA: string;
    latencyB: string;
    throughputA: string;
    throughputB: string;
    analysis: string;
  };
  toolCalling: {
    modelA: string;
    modelB: string;
    supportedA: boolean;
    supportedB: boolean;
    analysis: string;
  };
  vision: {
    modelA: string;
    modelB: string;
    supportedA: boolean;
    supportedB: boolean;
    analysis: string;
  };
  coding: {
    modelA: string;
    modelB: string;
    analysis: string;
  };
  availability: {
    modelA: string;
    modelB: string;
    analysis: string;
  };
  ecosystem: {
    modelA: string;
    modelB: string;
    analysis: string;
  };
  releases: ModelComparisonRelease[];
  tradeoffs: {
    whenToChooseA: string[];
    whenToChooseB: string[];
    summary: string;
  };
  recommendation?: ModelComparisonRecommendation;
  evidence: ModelComparisonEvidence[];
  sources: ModelComparisonSource[];
  // Backwards compatibility for previous simple UI
  comparison?: {
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
