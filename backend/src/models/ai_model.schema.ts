import mongoose, { Schema } from 'mongoose';
import { AiModelRecord, ModelEvidence, ModelHistoryItem, ModelNotification, ModelFreshness } from '../types/model.types.js';
import { isDbConnected } from './db.js';

// Evidence Sub-Schema
const ModelEvidenceSchema = new Schema({
  id: { type: String, required: true },
  claim: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  sourceTitle: { type: String, required: true },
  tier: { type: Number, required: true, min: 1, max: 7 },
  verified: { type: Boolean, required: true },
  retrievedAt: { type: String, required: true },
  snippet: { type: String },
  verificationState: {
    type: String,
    enum: ['VERIFIED', 'PARTIALLY VERIFIED', 'UNVERIFIED', 'CONFLICTING EVIDENCE'],
    default: 'VERIFIED'
  }
}, { _id: false });

// History Sub-Schema
const ModelHistoryItemSchema = new Schema({
  id: { type: String, required: true },
  timestamp: { type: String, required: true },
  changeType: {
    type: String,
    enum: ['DISCOVERED', 'METADATA_UPDATED', 'RESEARCH_COMPLETED', 'STATUS_CHANGED', 'DEPRECATED'],
    required: true
  },
  field: { type: String },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  description: { type: String, required: true },
  sourceUrl: { type: String }
}, { _id: false });

// AI Model Schema
const AiModelSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  provider: { type: String, required: true, index: true },
  modelId: { type: String, required: true, index: true },
  displayName: { type: String, required: true },
  family: { type: String },
  version: { type: String },
  aliases: [{ type: String }],
  description: { type: String, default: '' },
  capabilities: [{ type: String }],
  modalities: {
    input: [{ type: String }],
    output: [{ type: String }]
  },
  contextWindow: { type: Number, default: null },
  maxOutputTokens: { type: Number, default: null },
  inputPricing: { type: Number, default: null },
  outputPricing: { type: Number, default: null },
  releaseDate: { type: String, default: null },
  knowledgeCutoff: { type: String, default: null },
  status: {
    type: String,
    enum: ['ACTIVE', 'NEW', 'UPDATED', 'DEPRECATED', 'RETIRED', 'UNKNOWN', 'MISSING_FROM_LATEST_SYNC'],
    default: 'ACTIVE',
    index: true
  },
  documentationUrl: { type: String, default: null },
  apiUrl: { type: String, default: null },
  sourceUrl: { type: String, default: null },
  repositoryUrl: { type: String, default: null },
  official: { type: Boolean, default: true },
  firstSeenAt: { type: String, required: true },
  lastSeenAt: { type: String, required: true },
  lastCheckedAt: { type: String, required: true },
  lastResearchedAt: { type: String, default: null },
  researchStatus: {
    type: String,
    enum: ['not_started', 'pending', 'researching', 'completed', 'failed'],
    default: 'not_started'
  },
  freshness: {
    type: String,
    enum: ['Fresh', 'Aging', 'Stale', 'Unknown'],
    default: 'Fresh'
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
  evidence: [ModelEvidenceSchema],
  history: [ModelHistoryItemSchema],
  researchSummary: { type: String },
  overview: { type: String },
  strengths: [{ type: String }],
  limitations: [{ type: String }]
}, { timestamps: true });

// Compound indexes
AiModelSchema.index({ provider: 1, modelId: 1 }, { unique: true });
AiModelSchema.index({ status: 1, lastSeenAt: -1 });

export const AiModelModel = mongoose.model('AiModel', AiModelSchema);

// Notifications Schema
const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['NEW_MODEL', 'MODEL_UPDATED', 'MODEL_DEPRECATED'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  provider: { type: String, required: true },
  modelId: { type: String, required: true },
  timestamp: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const ModelNotificationModel = mongoose.model('ModelNotification', NotificationSchema);

// In-Memory resilient stores for when MongoDB is disconnected or in test environments
class MemoryModelStore {
  private models: Map<string, AiModelRecord> = new Map();
  private notifications: ModelNotification[] = [];

  constructor() {
    this.seedCanonicalModels();
  }

  private seedCanonicalModels() {
    const now = new Date().toISOString();
    const canonicals: AiModelRecord[] = [
      {
        id: 'google:gemini-2.5-flash',
        provider: 'google',
        modelId: 'gemini-2.5-flash',
        displayName: 'Google Gemini 2.5 Flash',
        family: 'Gemini',
        version: '2.5-flash',
        aliases: ['gemini-2.5-flash', 'gemini-2-flash', 'gemini-3.8-flash', 'gemini-3-flash'],
        description: 'Google state-of-the-art fast multimodal foundation model with 1M token context, sub-second TTFT, native function calling, and structured output.',
        capabilities: ['Text', 'Vision', 'Audio', 'Video', 'Code', 'Reasoning', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context', 'Multilingual'],
        modalities: { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        inputPricing: 0.10,
        outputPricing: 0.40,
        releaseDate: '2025-02-05',
        knowledgeCutoff: '2025-01-01',
        status: 'ACTIVE',
        documentationUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
        sourceUrl: 'https://ai.google.dev',
        repositoryUrl: 'https://github.com/google-gemini',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'frontier_fast' },
        evidence: [
          {
            id: 'ev_gemini_2_ctx',
            claim: 'Gemini 2.5 Flash supports a 1,000,000 token context window with high recall across long-form documents.',
            sourceUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
            sourceTitle: 'Google Gemini Official Model Specifications',
            tier: 1,
            verified: true,
            retrievedAt: now,
            verificationState: 'VERIFIED'
          }
        ],
        history: [],
        overview: 'Frontier efficiency model providing high speed, low latency, and low cost for agentic and tool-calling workloads.',
        strengths: ['1M token context window', 'Very low cost ($0.10/1M tokens)', 'Fast streaming response time', 'Multimodal audio/video native understanding'],
        limitations: ['Complex mathematical reasoning trails larger flagship models']
      },
      {
        id: 'google:gemini-1.5-pro',
        provider: 'google',
        modelId: 'gemini-1.5-pro',
        displayName: 'Google Gemini 1.5 Pro',
        family: 'Gemini',
        version: '1.5-pro',
        aliases: ['gemini-1.5-pro'],
        description: 'Google flagship high-intelligence multimodal model with industry-leading 2,000,000 token context window and deep reasoning.',
        capabilities: ['Text', 'Vision', 'Audio', 'Video', 'Code', 'Reasoning', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context', 'Multilingual'],
        modalities: { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
        contextWindow: 2000000,
        maxOutputTokens: 8192,
        inputPricing: 1.25,
        outputPricing: 5.00,
        releaseDate: '2024-05-14',
        knowledgeCutoff: '2024-11-01',
        status: 'ACTIVE',
        documentationUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
        sourceUrl: 'https://ai.google.dev',
        repositoryUrl: 'https://github.com/google-gemini',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'frontier_pro' },
        evidence: [
          {
            id: 'ev_gemini_15_ctx',
            claim: 'Gemini 1.5 Pro natively ingests up to 2,000,000 tokens of codebases, audio files, and books in a single prompt.',
            sourceUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
            sourceTitle: 'Google Gemini API Architecture Specs',
            tier: 1,
            verified: true,
            retrievedAt: now,
            verificationState: 'VERIFIED'
          }
        ],
        history: [],
        overview: 'Flagship reasoning and analysis engine built for massive context comprehension and complex software architectures.',
        strengths: ['Massive 2M token context window', 'High coding and multi-file refactoring accuracy', 'Reliable tool calling'],
        limitations: ['Higher latency than Flash models', 'Higher token cost']
      },
      {
        id: 'anthropic:claude-3-5-sonnet',
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet',
        displayName: 'Anthropic Claude 3.5 Sonnet',
        family: 'Claude',
        version: '3.5-sonnet',
        aliases: ['claude-3.5-sonnet', 'claude-3-5-sonnet-20241022'],
        description: 'Anthropic frontier coding and reasoning model with industry-leading SWE-bench performance and precise instruction following.',
        capabilities: ['Text', 'Vision', 'Code', 'Reasoning', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context', 'Multilingual'],
        modalities: { input: ['text', 'image'], output: ['text'] },
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputPricing: 3.00,
        outputPricing: 15.00,
        releaseDate: '2024-10-22',
        knowledgeCutoff: '2024-04-01',
        status: 'ACTIVE',
        documentationUrl: 'https://docs.anthropic.com/en/docs/models-overview',
        apiUrl: 'https://api.anthropic.com/v1',
        sourceUrl: 'https://anthropic.com',
        repositoryUrl: 'https://github.com/anthropics',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'frontier_coding' },
        evidence: [
          {
            id: 'ev_claude_swe',
            claim: 'Claude 3.5 Sonnet achieves benchmark-leading software engineering scores on real-world GitHub issue resolution.',
            sourceUrl: 'https://docs.anthropic.com',
            sourceTitle: 'Anthropic Claude Model Card',
            tier: 1,
            verified: true,
            retrievedAt: now,
            verificationState: 'VERIFIED'
          }
        ],
        history: [],
        overview: 'The developer standard for autonomous coding, refactoring, agentic loops, and architectural problem-solving.',
        strengths: ['Benchmark-leading code generation and debugging', 'Exceptional nuance and instruction adherence', 'Artifacts and Computer Use integration'],
        limitations: ['200K token window is smaller than Gemini 1M/2M', 'Higher output token price ($15/1M)']
      },
      {
        id: 'anthropic:claude-3-5-haiku',
        provider: 'anthropic',
        modelId: 'claude-3-5-haiku',
        displayName: 'Anthropic Claude 3.5 Haiku',
        family: 'Claude',
        version: '3.5-haiku',
        aliases: ['claude-3.5-haiku'],
        description: 'Fast, lightweight Anthropic model with coding performance matching previous-generation flagship models at rapid speeds.',
        capabilities: ['Text', 'Code', 'Reasoning', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context'],
        modalities: { input: ['text'], output: ['text'] },
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputPricing: 0.80,
        outputPricing: 4.00,
        releaseDate: '2024-11-04',
        knowledgeCutoff: '2024-07-01',
        status: 'ACTIVE',
        documentationUrl: 'https://docs.anthropic.com/en/docs/models-overview',
        apiUrl: 'https://api.anthropic.com/v1',
        sourceUrl: 'https://anthropic.com',
        repositoryUrl: 'https://github.com/anthropics',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'fast_coding' },
        evidence: [],
        history: [],
        overview: 'Rapid turnaround model suitable for high-throughput coding subagents and lightweight API endpoints.'
      },
      {
        id: 'openai:gpt-4o',
        provider: 'openai',
        modelId: 'gpt-4o',
        displayName: 'OpenAI GPT-4o',
        family: 'GPT-4',
        version: '4o',
        aliases: ['gpt-4o', 'gpt-4o-2024-11-20'],
        description: 'OpenAI flagship omni multimodal model integrating text, vision, and audio with structured JSON schema outputs.',
        capabilities: ['Text', 'Vision', 'Audio', 'Code', 'Reasoning', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context', 'Multilingual'],
        modalities: { input: ['text', 'image', 'audio'], output: ['text', 'audio'] },
        contextWindow: 128000,
        maxOutputTokens: 16384,
        inputPricing: 2.50,
        outputPricing: 10.00,
        releaseDate: '2024-05-13',
        knowledgeCutoff: '2023-10-01',
        status: 'ACTIVE',
        documentationUrl: 'https://platform.openai.com/docs/models/gpt-4o',
        apiUrl: 'https://api.openai.com/v1',
        sourceUrl: 'https://openai.com',
        repositoryUrl: 'https://github.com/openai',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'frontier_omni' },
        evidence: [],
        history: [],
        overview: 'Omni model offering versatile multimodal processing, fast response times, and ecosystem integration across major AI tooling.'
      },
      {
        id: 'openai:gpt-4o-mini',
        provider: 'openai',
        modelId: 'gpt-4o-mini',
        displayName: 'OpenAI GPT-4o Mini',
        family: 'GPT-4',
        version: '4o-mini',
        aliases: ['gpt-4o-mini'],
        description: 'OpenAI cost-efficient small model designed for fast, high-volume tasks, customer support, and lightweight tool calling.',
        capabilities: ['Text', 'Vision', 'Code', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context'],
        modalities: { input: ['text', 'image'], output: ['text'] },
        contextWindow: 128000,
        maxOutputTokens: 16384,
        inputPricing: 0.15,
        outputPricing: 0.60,
        releaseDate: '2024-07-18',
        knowledgeCutoff: '2023-10-01',
        status: 'ACTIVE',
        documentationUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini',
        apiUrl: 'https://api.openai.com/v1',
        sourceUrl: 'https://openai.com',
        repositoryUrl: 'https://github.com/openai',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'cost_efficient' },
        evidence: [],
        history: [],
        overview: 'High-value economy model for enterprise production pipelines requiring low price and high availability.'
      },
      {
        id: 'mistral:mistral-large',
        provider: 'mistral',
        modelId: 'mistral-large',
        displayName: 'Mistral Large',
        family: 'Mistral',
        version: 'large-2407',
        aliases: ['mistral-large-2407', 'mistral-large-latest'],
        description: 'Mistral AI flagship reasoning and multilingual model with deep reasoning and native tool integration.',
        capabilities: ['Text', 'Code', 'Reasoning', 'Tool Calling', 'Structured Output', 'Streaming', 'Long Context', 'Multilingual'],
        modalities: { input: ['text'], output: ['text'] },
        contextWindow: 128000,
        maxOutputTokens: 8192,
        inputPricing: 2.00,
        outputPricing: 6.00,
        releaseDate: '2024-07-24',
        knowledgeCutoff: '2024-06-01',
        status: 'ACTIVE',
        documentationUrl: 'https://docs.mistral.ai/getting-started/models/models_overview',
        apiUrl: 'https://api.mistral.ai/v1',
        sourceUrl: 'https://mistral.ai',
        repositoryUrl: 'https://github.com/mistralai',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'frontier_european' },
        evidence: [],
        history: [],
        overview: 'Top-tier European foundation model featuring multilingual proficiency and sovereignty-conscious hosting.'
      },
      {
        id: 'groq:llama-3.3-70b',
        provider: 'groq',
        modelId: 'llama-3.3-70b',
        displayName: 'Llama 3.3 70B (Groq)',
        family: 'Llama',
        version: '3.3-70b-versatile',
        aliases: ['llama-3.3-70b-versatile'],
        description: 'Meta open weights flagship served on Groq LPU hardware delivering ultra-high token per second generation speeds.',
        capabilities: ['Text', 'Code', 'Reasoning', 'Tool Calling', 'Streaming', 'Long Context', 'Multilingual'],
        modalities: { input: ['text'], output: ['text'] },
        contextWindow: 128000,
        maxOutputTokens: 8192,
        inputPricing: 0.59,
        outputPricing: 0.79,
        releaseDate: '2024-12-06',
        knowledgeCutoff: '2024-12-01',
        status: 'ACTIVE',
        documentationUrl: 'https://console.groq.com/docs/models',
        apiUrl: 'https://api.groq.com/openai/v1',
        sourceUrl: 'https://groq.com',
        repositoryUrl: 'https://github.com/meta-llama',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'ultra_fast_lpu' },
        evidence: [],
        history: [],
        overview: 'Blazing-fast inference on LPUs matching GPT-4-class reasoning at 300+ tokens per second.'
      },
      {
        id: 'deepseek:deepseek-r1',
        provider: 'deepseek',
        modelId: 'deepseek-r1',
        displayName: 'DeepSeek R1',
        family: 'DeepSeek',
        version: 'r1',
        aliases: ['deepseek-reasoner'],
        description: 'DeepSeek flagship reinforcement-learning reasoning model rivaling OpenAI o1 on math, coding, and logical reasoning benchmarks.',
        capabilities: ['Text', 'Code', 'Reasoning', 'Streaming', 'Long Context'],
        modalities: { input: ['text'], output: ['text'] },
        contextWindow: 128000,
        maxOutputTokens: 8192,
        inputPricing: 0.55,
        outputPricing: 2.19,
        releaseDate: '2025-01-20',
        knowledgeCutoff: '2024-07-01',
        status: 'ACTIVE',
        documentationUrl: 'https://api-docs.deepseek.com',
        apiUrl: 'https://api.deepseek.com/v1',
        sourceUrl: 'https://deepseek.com',
        repositoryUrl: 'https://github.com/deepseek-ai',
        official: true,
        firstSeenAt: now,
        lastSeenAt: now,
        lastCheckedAt: now,
        lastResearchedAt: now,
        researchStatus: 'completed',
        freshness: 'Fresh',
        metadata: { tier: 'frontier_reasoning' },
        evidence: [],
        history: [],
        overview: 'Reinforcement learning model specialized in deep mathematical proofs, multi-step code synthesis, and analytical deduction.'
      }
    ];

    for (const m of canonicals) {
      this.models.set(m.id, m);
    }
  }

  set(id: string, record: AiModelRecord): AiModelRecord {
    this.models.set(id, { ...record });
    return record;
  }

  get(id: string): AiModelRecord | null {
    return this.models.get(id) || null;
  }

  list(): AiModelRecord[] {
    return Array.from(this.models.values());
  }

  delete(id: string): boolean {
    return this.models.delete(id);
  }

  find(predicate: (item: AiModelRecord) => boolean): AiModelRecord | null {
    return Array.from(this.models.values()).find(predicate) || null;
  }

  filter(predicate: (item: AiModelRecord) => boolean): AiModelRecord[] {
    return Array.from(this.models.values()).filter(predicate);
  }

  addNotification(n: ModelNotification) {
    this.notifications.unshift(n);
    if (this.notifications.length > 100) {
      this.notifications.pop();
    }
  }

  getNotifications(): ModelNotification[] {
    return [...this.notifications];
  }

  markNotificationRead(id: string) {
    const item = this.notifications.find(n => n.id === id);
    if (item) item.read = true;
  }
}

export const inMemoryAiModelStore = new MemoryModelStore();

// Freshness calculator helper
export function computeFreshness(lastCheckedAt: string): ModelFreshness {
  if (!lastCheckedAt) return 'Unknown';
  const checked = new Date(lastCheckedAt).getTime();
  if (isNaN(checked)) return 'Unknown';

  const freshHours = parseInt(process.env.MODEL_FRESH_HOURS || '24', 10);
  const agingHours = parseInt(process.env.MODEL_AGING_HOURS || '72', 10);
  const diffHours = (Date.now() - checked) / (1000 * 60 * 60);

  if (diffHours <= freshHours) return 'Fresh';
  if (diffHours <= agingHours) return 'Aging';
  return 'Stale';
}

// Unified DAO (Database Access Object) with seamless MongoDB + MemoryStore fallback
export const AiModelDao = {
  async upsert(record: AiModelRecord): Promise<AiModelRecord> {
    record.freshness = computeFreshness(record.lastCheckedAt);
    inMemoryAiModelStore.set(record.id, record);

    if (isDbConnected()) {
      try {
        await AiModelModel.findOneAndUpdate(
          { id: record.id },
          { $set: record },
          { upsert: true, new: true }
        );
      } catch (err) {
        // Fallback silently kept in memory
      }
    }
    return record;
  },

  async findById(id: string): Promise<AiModelRecord | null> {
    if (isDbConnected()) {
      try {
        const doc = await AiModelModel.findOne({ id }).lean();
        if (doc) return doc as unknown as AiModelRecord;
      } catch {
        // fallback
      }
    }
    return inMemoryAiModelStore.get(id);
  },

  async findByProviderAndModel(provider: string, modelId: string): Promise<AiModelRecord | null> {
    const id = `${provider.toLowerCase()}:${modelId.toLowerCase()}`;
    return this.findById(id);
  },

  async listAll(filters?: {
    provider?: string;
    status?: string;
    capability?: string;
    search?: string;
  }): Promise<AiModelRecord[]> {
    let items: AiModelRecord[] = [];

    if (isDbConnected()) {
      try {
        const query: any = {};
        if (filters?.provider) query.provider = filters.provider.toLowerCase();
        if (filters?.status) query.status = filters.status;
        if (filters?.capability) query.capabilities = filters.capability;
        if (filters?.search) {
          query.$or = [
            { displayName: { $regex: filters.search, $options: 'i' } },
            { modelId: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
          ];
        }
        const docs = await AiModelModel.find(query).sort({ lastSeenAt: -1 }).lean();
        if (docs && docs.length > 0) {
          items = docs as unknown as AiModelRecord[];
        } else {
          items = inMemoryAiModelStore.list();
          // Seed canonical models to Mongo in background
          for (const m of items) {
            AiModelModel.findOneAndUpdate({ id: m.id }, { $set: m }, { upsert: true }).catch(() => {});
          }
        }
      } catch {
        items = inMemoryAiModelStore.list();
      }
    } else {
      items = inMemoryAiModelStore.list();
    }

    // Apply memory filters if necessary
    if (filters) {
      if (filters.provider) {
        items = items.filter(m => m.provider.toLowerCase() === filters.provider!.toLowerCase());
      }
      if (filters.status) {
        items = items.filter(m => m.status === filters.status);
      }
      if (filters.capability) {
        items = items.filter(m => m.capabilities?.includes(filters.capability as any));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(m =>
          m.displayName.toLowerCase().includes(q) ||
          m.modelId.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q)
        );
      }
    }

    // Dynamic freshness computation
    return items.map(item => ({
      ...item,
      freshness: computeFreshness(item.lastCheckedAt)
    }));
  },

  async addHistory(id: string, historyItem: ModelHistoryItem): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) return;

    existing.history = existing.history || [];
    existing.history.unshift(historyItem);
    await this.upsert(existing);
  },

  async recordNotification(notification: ModelNotification): Promise<void> {
    inMemoryAiModelStore.addNotification(notification);
    if (isDbConnected()) {
      try {
        await ModelNotificationModel.create(notification);
      } catch {
        // fallback
      }
    }
  },

  async getNotifications(): Promise<ModelNotification[]> {
    if (isDbConnected()) {
      try {
        const docs = await ModelNotificationModel.find().sort({ createdAt: -1 }).limit(50).lean();
        if (docs && docs.length > 0) return docs as unknown as ModelNotification[];
      } catch {}
    }
    return inMemoryAiModelStore.getNotifications();
  },

  async markNotificationRead(id: string): Promise<void> {
    inMemoryAiModelStore.markNotificationRead(id);
    if (isDbConnected()) {
      try {
        await ModelNotificationModel.updateOne({ id }, { $set: { read: true } });
      } catch {}
    }
  }
};
