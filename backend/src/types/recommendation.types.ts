import { AiModelRecord, ModelCapability } from './model.types.js';

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
  values: Record<string, '✓' | '○' | '✗' | '—'>; // modelId -> symbol
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
