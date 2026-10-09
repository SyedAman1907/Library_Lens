import {
  ResearchRecord,
  ResearchProgressEvent,
  ClaimChallengeResult,
  ReportVersion,
  Evidence
} from '../types';

const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export interface SubmitResearchInput {
  question?: string;
  libraryA?: string;
  libraryB?: string;
  useCase?: string;
  options?: {
    includeNews?: boolean;
    includeVisuals?: boolean;
    forceRefresh?: boolean;
  };
}

export async function submitResearch(
  inputOrLibA: string | SubmitResearchInput,
  libraryB?: string,
  useCase?: string,
  options?: { includeNews?: boolean; includeVisuals?: boolean }
): Promise<ResearchRecord> {
  let bodyPayload: SubmitResearchInput;

  if (typeof inputOrLibA === 'object' && inputOrLibA !== null) {
    bodyPayload = inputOrLibA;
  } else {
    bodyPayload = {
      libraryA: inputOrLibA,
      libraryB: libraryB || '',
      useCase: useCase || '',
      options
    };
  }

  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to start research');
  }

  return res.json();
}

export async function fetchResearchById(id: string): Promise<ResearchRecord> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Research not found (${res.status})`);
  }
  return res.json();
}

export async function fetchResearchSources(id: string): Promise<{ researchId: string; total: number; sources: any[] }> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/sources`);
  if (!res.ok) {
    throw new Error('Failed to retrieve sources');
  }
  return res.json();
}

export async function fetchResearchEvidence(id: string): Promise<{ researchId: string; total: number; evidence: Evidence[] }> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/evidence`);
  if (!res.ok) {
    throw new Error('Failed to retrieve evidence');
  }
  return res.json();
}

export async function fetchResearchClaims(id: string): Promise<{ researchId: string; total: number; claims: any[] }> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/claims`);
  if (!res.ok) {
    throw new Error('Failed to retrieve claims');
  }
  return res.json();
}

export async function challengeClaimApi(
  id: string,
  claimId: string,
  claimText?: string
): Promise<ClaimChallengeResult> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/claims/${encodeURIComponent(claimId)}/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimText })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to challenge claim');
  }

  return res.json();
}

export async function fetchResearchVersions(id: string): Promise<{ researchId: string; total: number; versions: ReportVersion[] }> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/versions`);
  if (!res.ok) {
    throw new Error('Failed to retrieve versions');
  }
  return res.json();
}

export async function replayResearchApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/replay`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to replay research');
  }
  return res.json();
}

export async function fetchResearchHistory(limit = 50): Promise<{ total: number; items: ResearchRecord[] }> {
  const res = await fetch(`${API_BASE}/research?limit=${limit}`);
  if (!res.ok) {
    throw new Error('Failed to retrieve research history');
  }
  return res.json();
}

export async function deleteResearchRecord(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete research record');
  }
  return res.json();
}

export async function triggerRefreshResearch(id: string): Promise<ResearchRecord> {
  const res = await fetch(`${API_BASE}/research/${encodeURIComponent(id)}/refresh`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to refresh research');
  }
  return res.json();
}

export function connectProgressStream(
  researchId: string,
  onEvent: (event: ResearchProgressEvent) => void,
  onError?: (err: any) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/research/stream/${encodeURIComponent(researchId)}`);

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(data);
    } catch {
      // Ignore parse ping
    }
  };

  eventSource.onerror = (err) => {
    if (onError) onError(err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

// ==========================================
// AI Model Radar & Discovery API Client
// ==========================================

export async function fetchModelRadar(): Promise<import('../types').ModelRadarStats> {
  const res = await fetch(`${API_BASE}/models/radar`);
  if (!res.ok) throw new Error('Failed to fetch model radar stats');
  return res.json();
}

export async function fetchModels(filters?: {
  provider?: string;
  status?: string;
  capability?: string;
  search?: string;
}): Promise<{ total: number; models: import('../types').AiModelRecord[] }> {
  const params = new URLSearchParams();
  if (filters?.provider) params.append('provider', filters.provider);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.capability) params.append('capability', filters.capability);
  if (filters?.search) params.append('search', filters.search);

  const url = `${API_BASE}/models?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function fetchModelDetails(provider: string, modelId: string): Promise<import('../types').AiModelRecord> {
  const res = await fetch(`${API_BASE}/models/${encodeURIComponent(provider)}/${encodeURIComponent(modelId)}`);
  if (!res.ok) throw new Error('Failed to fetch model details');
  return res.json();
}

export async function triggerModelSync(force = false): Promise<{ message: string; status: any }> {
  const res = await fetch(`${API_BASE}/models/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to trigger model sync');
  }
  return res.json();
}

export async function fetchModelSyncStatus(): Promise<import('../types').ModelSyncProgress> {
  const res = await fetch(`${API_BASE}/models/sync/status`);
  if (!res.ok) throw new Error('Failed to fetch sync status');
  return res.json();
}

export async function fetchModelNotifications(): Promise<{ notifications: import('../types').ModelNotification[] }> {
  const res = await fetch(`${API_BASE}/models/notifications`);
  if (!res.ok) throw new Error('Failed to fetch model notifications');
  return res.json();
}

export async function markModelNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/models/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
}

export async function compareAiModels(
  modelA: string,
  modelB: string,
  requirements?: string,
  compareId?: string,
  forceRefresh?: boolean
): Promise<import('../types').ModelComparisonResult> {
  const res = await fetch(`${API_BASE}/models/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelA, modelB, requirements, compareId, forceRefresh })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to compare models');
  }
  return res.json();
}

export async function forceResearchModel(provider: string, modelId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/models/${encodeURIComponent(provider)}/${encodeURIComponent(modelId)}/research`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to queue research');
}

// ==========================================
// AI Model Recommendation Engine APIs
// ==========================================

export async function analyzeModelRecommendation(input: {
  prompt: string;
  constraints?: Partial<import('../types').ExtractedRequirements>;
}): Promise<import('../types').RecommendationAnalysis> {
  const res = await fetch(`${API_BASE}/models/recommendations/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to analyze requirements');
  }
  return res.json();
}

export async function fetchRecommendationAnalysis(id: string): Promise<import('../types').RecommendationAnalysis> {
  const res = await fetch(`${API_BASE}/models/recommendations/analysis/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch recommendation analysis');
  return res.json();
}

export async function challengeModelRecommendation(id: string): Promise<{
  analysis: import('../types').RecommendationAnalysis;
  counterSources: import('../types').CounterSourceItem[];
  findings: string;
  changesSummary: string;
  challengedAt: string;
}> {
  const res = await fetch(`${API_BASE}/models/recommendations/${encodeURIComponent(id)}/challenge`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to challenge recommendation');
  }
  return res.json();
}

export async function refreshModelRecommendation(id: string): Promise<{
  analysis: import('../types').RecommendationAnalysis;
  previousTopModelId?: string;
  newTopModelId?: string;
  hasChanges: boolean;
  reasonForUpdate: string;
  sourcesRefreshed: number;
  refreshedAt: string;
}> {
  const res = await fetch(`${API_BASE}/models/recommendations/${encodeURIComponent(id)}/refresh`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to refresh recommendation');
  }
  return res.json();
}

export async function fetchSavedUseCases(): Promise<{
  total: number;
  useCases: import('../types').SavedUseCase[];
}> {
  const res = await fetch(`${API_BASE}/models/recommendations/saved-use-cases`);
  if (!res.ok) throw new Error('Failed to fetch saved use cases');
  return res.json();
}

export async function saveModelUseCase(useCase: Partial<import('../types').SavedUseCase>): Promise<import('../types').SavedUseCase> {
  const res = await fetch(`${API_BASE}/models/recommendations/saved-use-cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(useCase)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to save use case');
  }
  return res.json();
}

export async function deleteModelUseCase(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/models/recommendations/saved-use-cases/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete saved use case');
  return res.json();
}

export async function checkUseCaseModelUpdates(id: string): Promise<{
  useCase: import('../types').SavedUseCase;
  hasUpdate: boolean;
  previousTopModelId?: string;
  newTopModelId?: string;
  analysis: import('../types').RecommendationAnalysis;
}> {
  const res = await fetch(`${API_BASE}/models/recommendations/saved-use-cases/${encodeURIComponent(id)}/check-updates`);
  if (!res.ok) throw new Error('Failed to check for model updates');
  return res.json();
}


