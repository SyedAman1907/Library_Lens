import mongoose, { Schema } from 'mongoose';
import { RecommendationAnalysis, SavedUseCase } from '../types/recommendation.types.js';
import { isDbConnected } from './db.js';

// Recommendation Analysis Mongoose Schema
const RecommendationAnalysisSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  userPrompt: { type: String, required: true },
  detectedRequirements: { type: Schema.Types.Mixed, required: true },
  relevantFactors: [{ type: String }],
  confidence: { type: String, enum: ['High', 'Medium', 'Limited'], required: true },
  confidenceReason: { type: String, required: true },
  recommendations: [{ type: Schema.Types.Mixed }],
  comparisonMatrix: { type: Schema.Types.Mixed },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  challengedAt: { type: String },
  challengeHistory: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

export const RecommendationAnalysisModel = mongoose.model('RecommendationAnalysis', RecommendationAnalysisSchema);

// Saved Use Case Mongoose Schema
const SavedUseCaseSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  requirements: { type: Schema.Types.Mixed, required: true },
  currentRecommendedModelIds: [{ type: String }],
  lastCheckedAt: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
}, { timestamps: true });

export const SavedUseCaseModel = mongoose.model('SavedUseCase', SavedUseCaseSchema);

// Resilient In-Memory Stores
class MemoryRecommendationStore {
  private analyses: Map<string, RecommendationAnalysis> = new Map();
  private useCases: Map<string, SavedUseCase> = new Map();

  constructor() {
    // Seed default common developer use cases
    const defaultUseCases: SavedUseCase[] = [
      {
        id: 'usecase-coding-assistant',
        name: 'Coding & Refactoring Assistant',
        prompt: 'I need a model for a coding assistant with strong reasoning, tool calling, and large context',
        requirements: {
          useCase: 'Coding Assistant',
          capabilitiesRequired: ['Code', 'Reasoning', 'Tool Calling', 'Long Context'],
          codeRequired: true,
          toolCallingRequired: true,
          reasoningRequired: true,
          minContextWindow: 64000
        },
        currentRecommendedModelIds: [],
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usecase-customer-support',
        name: 'Customer Support Chatbot',
        prompt: 'Low-cost fast model for high-volume customer support chatbot',
        requirements: {
          useCase: 'Customer Support Chatbot',
          budget: 'low',
          latencyPriority: 'low',
          capabilitiesRequired: ['Text', 'Streaming', 'Structured Output'],
          structuredOutputRequired: true
        },
        currentRecommendedModelIds: [],
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usecase-document-analysis',
        name: 'Large Document Analysis (1M+ Tokens)',
        prompt: 'Analyze multi-hundred page technical manuals and books with 1M+ context window',
        requirements: {
          useCase: 'Large Document Analysis',
          minContextWindow: 1000000,
          capabilitiesRequired: ['Text', 'Long Context', 'Reasoning'],
          reasoningRequired: true
        },
        currentRecommendedModelIds: [],
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const uc of defaultUseCases) {
      this.useCases.set(uc.id, uc);
    }
  }

  // Analyses
  setAnalysis(analysis: RecommendationAnalysis): RecommendationAnalysis {
    this.analyses.set(analysis.id, { ...analysis });
    return analysis;
  }

  getAnalysis(id: string): RecommendationAnalysis | null {
    return this.analyses.get(id) || null;
  }

  // Use Cases
  setUseCase(useCase: SavedUseCase): SavedUseCase {
    this.useCases.set(useCase.id, { ...useCase });
    return useCase;
  }

  getUseCase(id: string): SavedUseCase | null {
    return this.useCases.get(id) || null;
  }

  listUseCases(): SavedUseCase[] {
    return Array.from(this.useCases.values());
  }

  deleteUseCase(id: string): boolean {
    return this.useCases.delete(id);
  }
}

export const inMemoryRecommendationStore = new MemoryRecommendationStore();

// Unified DAO with seamless MongoDB + MemoryStore fallback
export const RecommendationDao = {
  async saveAnalysis(analysis: RecommendationAnalysis): Promise<RecommendationAnalysis> {
    inMemoryRecommendationStore.setAnalysis(analysis);
    if (isDbConnected()) {
      try {
        await RecommendationAnalysisModel.findOneAndUpdate(
          { id: analysis.id },
          { $set: analysis },
          { upsert: true, new: true }
        );
      } catch {}
    }
    return analysis;
  },

  async getAnalysisById(id: string): Promise<RecommendationAnalysis | null> {
    if (isDbConnected()) {
      try {
        const doc = await RecommendationAnalysisModel.findOne({ id }).lean();
        if (doc) return doc as unknown as RecommendationAnalysis;
      } catch {}
    }
    return inMemoryRecommendationStore.getAnalysis(id);
  },

  async saveUseCase(useCase: SavedUseCase): Promise<SavedUseCase> {
    inMemoryRecommendationStore.setUseCase(useCase);
    if (isDbConnected()) {
      try {
        await SavedUseCaseModel.findOneAndUpdate(
          { id: useCase.id },
          { $set: useCase },
          { upsert: true, new: true }
        );
      } catch {}
    }
    return useCase;
  },

  async listUseCases(): Promise<SavedUseCase[]> {
    if (isDbConnected()) {
      try {
        const docs = await SavedUseCaseModel.find().sort({ updatedAt: -1 }).lean();
        if (docs && docs.length > 0) return docs as unknown as SavedUseCase[];
      } catch {}
    }
    return inMemoryRecommendationStore.listUseCases();
  },

  async getUseCaseById(id: string): Promise<SavedUseCase | null> {
    if (isDbConnected()) {
      try {
        const doc = await SavedUseCaseModel.findOne({ id }).lean();
        if (doc) return doc as unknown as SavedUseCase;
      } catch {}
    }
    return inMemoryRecommendationStore.getUseCase(id);
  },

  async deleteUseCase(id: string): Promise<boolean> {
    inMemoryRecommendationStore.deleteUseCase(id);
    if (isDbConnected()) {
      try {
        await SavedUseCaseModel.deleteOne({ id });
      } catch {}
    }
    return true;
  }
};
