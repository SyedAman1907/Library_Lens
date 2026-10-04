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
        items = docs as unknown as AiModelRecord[];
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
