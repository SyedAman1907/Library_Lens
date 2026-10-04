import mongoose, { Schema, Document } from 'mongoose';
import { ResearchRecord, Source, Evidence, ReleaseInfo } from '../types/research.types.js';

// Source Schema
const SourceSchema = new Schema({
  id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  sourceType: { type: String, required: true },
  tier: { type: Number, required: true, min: 1, max: 5 },
  publisher: { type: String, required: true },
  library: { type: String, required: true, index: true },
  claim: { type: String },
  snippet: { type: String, default: '' },
  publishedAt: { type: String, default: null },
  retrievedAt: { type: String, required: true },
  confidence: { type: Number, required: true },
  imageUrl: { type: String },
  thumbnailUrl: { type: String },
  width: { type: Number },
  height: { type: Number },
  rightsNotice: { type: String }
}, { timestamps: true });

// Evidence Schema
const EvidenceSchema = new Schema({
  id: { type: String, required: true, index: true },
  claim: { type: String, required: true },
  sourceIds: [{ type: String }],
  library: { type: String, required: true },
  confidence: { type: Number, required: true },
  verified: { type: Boolean, required: true },
  unverifiedReason: { type: String }
}, { timestamps: true });

// Release Schema
const ReleaseSchema = new Schema({
  library: { type: String, required: true, index: true },
  version: { type: String, required: true },
  releaseDate: { type: String },
  changelogUrl: { type: String },
  sourceId: { type: String, required: true },
  summary: { type: String },
  isPrerelease: { type: Boolean, default: false }
}, { timestamps: true });

// Claim Schema
const ClaimSchema = new Schema({
  id: { type: String, required: true, index: true },
  researchId: { type: String, required: true, index: true },
  claim: { type: String, required: true },
  library: { type: String, required: true },
  verificationState: {
    type: String,
    enum: ['VERIFIED', 'PARTIALLY VERIFIED', 'UNVERIFIED', 'CONFLICTING EVIDENCE'],
    default: 'VERIFIED'
  },
  confidence: { type: Number, required: true },
  sourceIds: [{ type: String }],
  contradictorySourceIds: [{ type: String }],
  unverifiedReason: { type: String }
}, { timestamps: true });

// Report Version Schema
const ReportVersionSchema = new Schema({
  researchId: { type: String, required: true, index: true },
  versionNumber: { type: Number, required: true },
  createdAt: { type: String, required: true },
  summary: { type: String },
  report: { type: Schema.Types.Mixed },
  diff: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Research Run Session / Replay Schema
const ResearchRunSchema = new Schema({
  researchId: { type: String, required: true, index: true },
  runNumber: { type: Number, default: 1 },
  startedAt: { type: String, required: true },
  completedAt: { type: String },
  question: { type: String },
  toolsUsed: [{ type: String }],
  queriesExecuted: [{ type: String }],
  events: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

// Comparison Summary Schema
const ComparisonSchema = new Schema({
  pairKey: { type: String, required: true, unique: true, index: true }, // e.g. "express:fastapi"
  libraryA: { type: String, required: true },
  libraryB: { type: String, required: true },
  latestResearchId: { type: String, required: true },
  lastResearchedAt: { type: String, required: true }
}, { timestamps: true });

// Research Schema
const ResearchSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  question: { type: String },
  questionAnalysis: { type: Schema.Types.Mixed },
  researchPlan: { type: Schema.Types.Mixed },
  suggestions: [{ type: Schema.Types.Mixed }],
  libraryA: { type: String, required: true, index: true },
  libraryB: { type: String, required: true, index: true },
  useCase: { type: String, default: '' },
  options: {
    includeNews: { type: Boolean, default: true },
    includeVisuals: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['pending', 'researching', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  lastResearchedAt: { type: String },
  lastVerifiedAt: { type: String },
  currentVersionNumber: { type: Number, default: 1 },
  sources: [SourceSchema],
  evidence: [EvidenceSchema],
  claims: [ClaimSchema],
  versions: [ReportVersionSchema],
  replayEvents: [{ type: Schema.Types.Mixed }],
  challenges: { type: Schema.Types.Mixed },
  report: { type: Schema.Types.Mixed },
  useCaseScenario: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for fast lookup of comparison pairs
ResearchSchema.index({ libraryA: 1, libraryB: 1 });

// TTL index: auto-expire researches after 7 days if configured
ResearchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const SourceModel = mongoose.model('Source', SourceSchema);
export const EvidenceModel = mongoose.model('Evidence', EvidenceSchema);
export const ClaimModel = mongoose.model('Claim', ClaimSchema);
export const ReleaseModel = mongoose.model('Release', ReleaseSchema);
export const ReportVersionModel = mongoose.model('ReportVersion', ReportVersionSchema);
export const ResearchRunModel = mongoose.model('ResearchRun', ResearchRunSchema);
export const ComparisonModel = mongoose.model('Comparison', ComparisonSchema);
export const ResearchModel = mongoose.model('Research', ResearchSchema);

