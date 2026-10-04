import { v4 as uuidv4 } from 'uuid';
import {
  ResearchRecord,
  ResearchProgressEvent,
  ComparisonReport,
  ReplayEvent,
  ReportVersion,
  QuestionAnalysis,
  ResearchPlan,
  ClaimVerificationState
} from '../types/research.types.js';
import { normalizeLibraryName } from './normalizer.js';
import { detectEcosystem } from './ecosystem.js';
import { createResearchPlan } from './planner.js';
import { analyzeResearchQuestion } from './analyzer.js';
import { collectEvidence } from '../evidence/collector.js';
import { synthesizeWithGemini } from '../gemini/researcher.js';
import { validateReportCitations } from '../citations/validator.js';
import { ResearchModel, ReportVersionModel, ClaimModel } from '../models/research.schema.js';
import { inMemoryResearchStore, isDbConnected } from '../models/db.js';
import { logger } from '../utils/logger.js';

type ProgressListener = (event: ResearchProgressEvent) => void;
const activeListeners = new Map<string, Set<ProgressListener>>();
const inMemoryReplayBuffers = new Map<string, ReplayEvent[]>();

export function subscribeToProgress(researchId: string, listener: ProgressListener): () => void {
  if (!activeListeners.has(researchId)) {
    activeListeners.set(researchId, new Set());
  }
  activeListeners.get(researchId)!.add(listener);

  return () => {
    const set = activeListeners.get(researchId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) activeListeners.delete(researchId);
    }
  };
}

export function emitProgress(
  researchId: string,
  step: string,
  message: string,
  progressPercent: number,
  details?: Record<string, unknown>
) {
  const event: ResearchProgressEvent = {
    researchId,
    step,
    message,
    progressPercent,
    timestamp: new Date().toISOString(),
    details
  };

  // Buffer replay event
  if (!inMemoryReplayBuffers.has(researchId)) {
    inMemoryReplayBuffers.set(researchId, []);
  }
  inMemoryReplayBuffers.get(researchId)!.push({
    step,
    message,
    progressPercent,
    timestamp: event.timestamp,
    details
  });

  const listeners = activeListeners.get(researchId);
  if (listeners) {
    listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (e) {
        logger.warn('Progress listener dispatch error', { error: String(e) });
      }
    });
  }
}

export interface RunResearchParams {
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

export async function runResearch(
  libraryAOrParams: string | RunResearchParams,
  libraryBInput = '',
  useCaseInput = '',
  optionsInput?: { includeNews?: boolean; includeVisuals?: boolean; forceRefresh?: boolean },
  existingId?: string
): Promise<ResearchRecord> {
  const startTime = Date.now();
  let questionParam = '';
  let libraryAStr = '';
  let libraryBStr = '';
  let useCaseStr = '';
  let options = optionsInput || {};

  if (typeof libraryAOrParams === 'object' && libraryAOrParams !== null) {
    questionParam = libraryAOrParams.question || '';
    libraryAStr = libraryAOrParams.libraryA || '';
    libraryBStr = libraryAOrParams.libraryB || '';
    useCaseStr = libraryAOrParams.useCase || '';
    options = libraryAOrParams.options || options;
  } else {
    libraryAStr = libraryAOrParams || '';
    libraryBStr = libraryBInput || '';
    useCaseStr = useCaseInput || '';
  }

  const researchId = existingId || `res_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  inMemoryReplayBuffers.set(researchId, []);

  // Step 1: Question Analysis (AI Research Agent pipeline entry)
  let questionAnalysis: QuestionAnalysis | undefined;
  const isNaturalQuestion = Boolean(questionParam || (!libraryBStr && libraryAStr.includes(' ')));

  if (isNaturalQuestion) {
    const rawQuestion = questionParam || libraryAStr;
    emitProgress(researchId, 'analyzing_question', 'Analyzing research question & determining investigation targets...', 8);
    questionAnalysis = await analyzeResearchQuestion(
      rawQuestion,
      libraryAStr || 'React',
      libraryBStr || 'Vue',
      useCaseStr || 'Production web application'
    );

    libraryAStr = questionAnalysis.identifiedLibraries[0] || 'React';
    libraryBStr = questionAnalysis.identifiedLibraries[1] || 'Vue';
    if (!useCaseStr || useCaseStr === 'Production web application') {
      useCaseStr = questionAnalysis.useCase || 'Production web application';
    }
    emitProgress(researchId, 'resolving_libraries', `Resolved research targets: ${libraryAStr} and ${libraryBStr}`, 14);
  } else {
    emitProgress(researchId, 'normalizing', 'Normalizing library names and verifying ecosystem compatibility...', 8);
  }

  const normA = normalizeLibraryName(libraryAStr);
  const normB = normalizeLibraryName(libraryBStr);

  const libraryA = normA.canonical;
  const libraryB = normB.canonical;
  const useCase = (useCaseStr || 'Production web application').trim();
  const naturalQuestion = questionParam || questionAnalysis?.originalQuestion || `${libraryA} vs ${libraryB} for ${useCase}`;

  // Check existing record for versioning or cache hit
  let existingRecord: ResearchRecord | null = null;
  if (existingId) {
    existingRecord = await getResearchById(existingId);
  }

  if (!options?.forceRefresh && !existingId) {
    const cached = await getResearchFromDb(libraryA, libraryB, useCase);
    if (cached && cached.status === 'completed') {
      logger.info(`Serving cached research for ${libraryA} vs ${libraryB}`);
      emitProgress(researchId, 'completed', 'Loaded verified research report from cache.', 100);
      return cached;
    }
  }

  // Step 2: Ecosystem detection
  emitProgress(researchId, 'ecosystem_detection', `Detecting package registries for ${libraryA} and ${libraryB}...`, 18);
  const [ecoA, ecoB] = await Promise.all([
    detectEcosystem(normA.defaultPackage, normA.ecosystem),
    detectEcosystem(normB.defaultPackage, normB.ecosystem)
  ]);

  // Step 3: Create Research Plan
  emitProgress(researchId, 'planning', `Generating 10-step multi-source research plan...`, 22);
  const plan = createResearchPlan(libraryA, libraryB, useCase, options);

  // Update plan actions
  plan.actions[0].status = 'running'; // identify versions
  plan.actions[1].status = 'running'; // official docs
  plan.actions[5].status = 'running'; // check github
  plan.actions[6].status = 'running'; // check package registry

  // Step 4: Run MCP Tools & Collect Evidence
  const evidenceResult = await collectEvidence(
    plan,
    { ecosystem: ecoA.ecosystem, packageName: ecoA.packageName },
    { ecosystem: ecoB.ecosystem, packageName: ecoB.packageName },
    (step, msg, pct) => emitProgress(researchId, step, msg, pct)
  );

  plan.actions[0].status = 'completed';
  plan.actions[1].status = 'completed';
  plan.actions[2].status = 'completed';
  plan.actions[3].status = 'completed';
  plan.actions[4].status = 'completed';
  plan.actions[5].status = 'completed';
  plan.actions[6].status = 'completed';
  plan.actions[7].status = 'completed';
  plan.actions[8].status = 'running'; // cross check

  // Step 5: Gemini AI Reasoning & Synthesis
  emitProgress(researchId, 'ai_reasoning', 'Synthesizing evidence and architectural trade-offs with Gemini...', 88);
  const partialReport = await synthesizeWithGemini(
    libraryA,
    libraryB,
    useCase,
    evidenceResult.sources,
    evidenceResult.releases,
    evidenceResult.versionDataA,
    evidenceResult.versionDataB
  );

  // Step 6: Strict Citation Validation & Claim Extraction
  emitProgress(researchId, 'citation_validation', 'Validating citations and verifying evidence relationships...', 94);
  const { validatedReport, summary: valSummary } = validateReportCitations(
    partialReport,
    evidenceResult.sources,
    libraryA,
    libraryB
  );

  plan.actions[8].status = 'completed';
  plan.actions[9].status = 'completed'; // generate report

  const durationMs = Date.now() - startTime;
  const timestampNow = new Date().toISOString();

  // Construct complete ComparisonReport
  const fullReport: ComparisonReport = {
    summary: validatedReport.summary || `${libraryA} and ${libraryB} comparison report backed by official sources.`,
    versionData: {
      libraryA: evidenceResult.versionDataA,
      libraryB: evidenceResult.versionDataB
    },
    featureMatrix: validatedReport.featureMatrix || [],
    recentReleases: evidenceResult.releases,
    recentDevelopments: evidenceResult.news,
    breakingChanges: validatedReport.breakingChanges || [],
    migration: validatedReport.migration || {
      fromLibrary: libraryA,
      toLibrary: libraryB,
      currentVersion: evidenceResult.versionDataA.currentVersion,
      targetVersion: evidenceResult.versionDataB.currentVersion,
      projectType: useCase,
      overview: 'Review official migration manuals before upgrading.',
      considerations: []
    },
    typeScriptSupport: validatedReport.typeScriptSupport || {
      libraryA: { level: 'Documented', details: 'See official documentation', sourceIds: [] },
      libraryB: { level: 'Documented', details: 'See official documentation', sourceIds: [] }
    },
    ecosystemAnalysis: validatedReport.ecosystemAnalysis || {
      libraryA: { tooling: [], stateOfEcosystem: 'Active', sourceIds: [] },
      libraryB: { tooling: [], stateOfEcosystem: 'Active', sourceIds: [] }
    },
    useCaseAnalysis: validatedReport.useCaseAnalysis || {
      useCase,
      considerations: [],
      tradeoffsSummary: 'Analyze both libraries against your system architecture and team expertise.'
    },
    visualReferences: evidenceResult.visuals,
    researchTransparency: {
      searchesPerformed: evidenceResult.stats.searchesPerformed,
      toolsUsed: evidenceResult.stats.toolsUsed,
      totalSourcesExamined: evidenceResult.stats.totalExamined,
      officialSourcesFound: evidenceResult.stats.officialCount,
      newsSourcesFound: evidenceResult.stats.newsCount,
      visualReferencesFound: evidenceResult.stats.visualsCount,
      verifiedClaimsCount: valSummary.validCitationsCount,
      researchDurationMs: durationMs,
      lastUpdated: timestampNow
    }
  };

  // Structured Claims list
  const structuredClaims = valSummary.evidenceItems.map((ev, idx) => ({
    id: `claim_${idx + 1}`,
    researchId,
    claim: ev.claim,
    library: ev.library,
    verificationState: (ev.verified ? 'VERIFIED' : 'UNVERIFIED') as ClaimVerificationState,
    confidence: ev.confidence,
    sourceIds: ev.sourceIds,
    contradictorySourceIds: [],
    unverifiedReason: ev.unverifiedReason
  }));

  // Version management
  const previousVersions: ReportVersion[] = existingRecord?.versions ? [...existingRecord.versions] : [];
  const currentVersionNumber = (existingRecord?.currentVersionNumber || 0) + 1;

  if (existingRecord && existingRecord.report) {
    const diff = {
      addedSourcesCount: Math.max(0, evidenceResult.sources.length - (existingRecord.sources?.length || 0)),
      removedSourcesCount: 0,
      newReleasesCount: Math.max(0, evidenceResult.releases.length - (existingRecord.report?.recentReleases?.length || 0)),
      updatedClaimsCount: valSummary.evidenceItems.length,
      changedVersions: {
        libraryA: {
          from: existingRecord.report?.versionData?.libraryA?.currentVersion || 'Unknown',
          to: evidenceResult.versionDataA.currentVersion
        },
        libraryB: {
          from: existingRecord.report?.versionData?.libraryB?.currentVersion || 'Unknown',
          to: evidenceResult.versionDataB.currentVersion
        }
      }
    };

    previousVersions.unshift({
      versionNumber: existingRecord.currentVersionNumber || 1,
      createdAt: existingRecord.updatedAt || existingRecord.createdAt,
      summary: existingRecord.report.summary,
      report: existingRecord.report,
      diff
    });
  }

  const replayEvents = inMemoryReplayBuffers.get(researchId) || [];

  const record: ResearchRecord = {
    id: researchId,
    question: naturalQuestion,
    questionAnalysis,
    researchPlan: plan,
    suggestions: (normA.suggestion || normB.suggestion)
      ? [normA.suggestion, normB.suggestion].filter(Boolean) as any[]
      : undefined,
    libraryA,
    libraryB,
    useCase,
    options,
    status: 'completed',
    createdAt: existingRecord?.createdAt || timestampNow,
    updatedAt: timestampNow,
    lastResearchedAt: timestampNow,
    lastVerifiedAt: timestampNow,
    currentVersionNumber,
    sources: evidenceResult.sources,
    evidence: valSummary.evidenceItems,
    report: fullReport,
    versions: previousVersions,
    replayEvents,
    challenges: existingRecord?.challenges || {}
  };

  // Step 7: Persist in Database
  await saveResearchToDb(record);

  emitProgress(researchId, 'completed', 'Research complete! Rendering verified comparison.', 100);

  return record;
}

export async function getResearchById(id: string): Promise<ResearchRecord | null> {
  if (isDbConnected()) {
    try {
      const doc = await ResearchModel.findOne({ id }).lean();
      if (doc) return doc as unknown as ResearchRecord;
    } catch (e) {
      logger.warn('Error reading from MongoDB, falling back to memory store', { error: String(e) });
    }
  }
  return inMemoryResearchStore.get(id);
}

export async function getResearchEvidence(id: string) {
  const record = await getResearchById(id);
  return record ? record.evidence || [] : [];
}

export async function getResearchClaims(id: string) {
  const record = await getResearchById(id);
  if (!record) return [];

  return (record.evidence || []).map((ev, idx) => ({
    id: `claim_${idx + 1}`,
    claim: ev.claim,
    library: ev.library,
    verificationState: ev.verified ? 'VERIFIED' : 'UNVERIFIED',
    confidence: ev.confidence,
    sourceIds: ev.sourceIds,
    unverifiedReason: ev.unverifiedReason
  }));
}

export async function getResearchVersions(id: string): Promise<ReportVersion[]> {
  const record = await getResearchById(id);
  return record?.versions || [];
}

export async function replayResearchSession(id: string) {
  const record = await getResearchById(id);
  if (!record) return null;

  return {
    researchId: id,
    originalResearchDate: record.createdAt,
    currentDataDate: new Date().toISOString(),
    question: record.question || `${record.libraryA} vs ${record.libraryB}`,
    plan: record.researchPlan,
    events: record.replayEvents || [],
    sourcesCount: record.sources?.length || 0,
    report: record.report
  };
}

async function getResearchFromDb(libraryA: string, libraryB: string, useCase: string): Promise<ResearchRecord | null> {
  if (isDbConnected()) {
    try {
      const doc = await ResearchModel.findOne({
        libraryA: new RegExp(`^${libraryA}$`, 'i'),
        libraryB: new RegExp(`^${libraryB}$`, 'i'),
        useCase: new RegExp(`^${useCase}$`, 'i')
      }).sort({ updatedAt: -1 }).lean();
      if (doc) return doc as unknown as ResearchRecord;
    } catch {
      // Continue to in-memory check
    }
  }

  return inMemoryResearchStore.find((item) =>
    item.libraryA?.toLowerCase() === libraryA.toLowerCase() &&
    item.libraryB?.toLowerCase() === libraryB.toLowerCase() &&
    item.useCase?.toLowerCase() === useCase.toLowerCase()
  );
}

async function saveResearchToDb(record: ResearchRecord): Promise<void> {
  inMemoryResearchStore.set(record.id, record);

  if (isDbConnected()) {
    try {
      await ResearchModel.findOneAndUpdate(
        { id: record.id },
        { ...record, updatedAt: new Date().toISOString() },
        { upsert: true, new: true }
      );
      logger.info(`Research record ${record.id} saved to MongoDB`);
    } catch (err) {
      logger.warn('Failed to persist research record to MongoDB', { error: String(err) });
    }
  }
}

export async function listResearches(limit = 50): Promise<ResearchRecord[]> {
  if (isDbConnected()) {
    try {
      const docs = await ResearchModel.find({}).sort({ updatedAt: -1 }).limit(limit).lean();
      if (docs && docs.length > 0) return docs as unknown as ResearchRecord[];
    } catch (e) {
      logger.warn('Error listing from MongoDB', { error: String(e) });
    }
  }
  return inMemoryResearchStore.list(limit);
}

export async function deleteResearchById(id: string): Promise<boolean> {
  if (isDbConnected()) {
    try {
      await ResearchModel.deleteOne({ id });
    } catch (e) {
      logger.warn('Error deleting from MongoDB', { error: String(e) });
    }
  }
  inMemoryResearchStore.delete(id);
  return true;
}

export async function refreshResearch(id: string): Promise<ResearchRecord> {
  const existing = await getResearchById(id);
  if (!existing) {
    throw new Error(`Research record not found for id: ${id}`);
  }
  return runResearch(
    {
      question: existing.question,
      libraryA: existing.libraryA,
      libraryB: existing.libraryB,
      useCase: existing.useCase,
      options: { ...existing.options, forceRefresh: true }
    },
    existing.libraryB,
    existing.useCase,
    { ...existing.options, forceRefresh: true },
    existing.id
  );
}

export { runResearch as executeAutonomousResearch };


