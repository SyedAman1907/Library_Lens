import { providerRegistry } from '../models/providers/provider.registry.js';
import { AiModelDao } from '../models/ai_model.schema.js';
import {
  AiModelRecord,
  DiscoveredModel,
  ModelSyncProgress,
  ModelHistoryItem,
  ModelNotification
} from '../types/model.types.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { modelResearchQueue } from './model_research_queue.service.js';
import { modelRecommendationService } from './model_recommendation.service.js';

class ModelDiscoveryService {
  private isSyncRunning = false;
  private currentProgress: ModelSyncProgress = {
    stage: 'idle',
    modelsDiscovered: 0,
    newModelsDetected: 0,
    updatedModelsDetected: 0,
    deprecatedModelsDetected: 0,
    researchedCount: 0,
    totalToResearch: 0,
    message: 'System idle',
    startedAt: null,
    completedAt: null
  };

  private lastSyncCompletedAt: string | null = null;
  private catalogCache: Map<string, { models: DiscoveredModel[]; cachedAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

  isSyncInProgress(): boolean {
    return this.isSyncRunning;
  }

  getProgress(): ModelSyncProgress {
    return { ...this.currentProgress };
  }

  getLastSyncTime(): string | null {
    return this.lastSyncCompletedAt;
  }

  /**
   * Run synchronization across all enabled providers.
   * Isolates failures so one failing provider never halts others.
   */
  async runSync(forceRefresh = false): Promise<{
    success: boolean;
    modelsDiscovered: number;
    newModelsDetected: number;
    updatedModelsDetected: number;
    deprecatedModelsDetected: number;
    message: string;
  }> {
    if (this.isSyncRunning) {
      throw new Error('Synchronization already in progress.');
    }

    this.isSyncRunning = true;
    const startTime = new Date().toISOString();
    logger.info('MODEL_DISCOVERY_STARTED', { forceRefresh, startedAt: startTime });

    this.currentProgress = {
      stage: 'discovering',
      modelsDiscovered: 0,
      newModelsDetected: 0,
      updatedModelsDetected: 0,
      deprecatedModelsDetected: 0,
      researchedCount: 0,
      totalToResearch: 0,
      message: 'Discovering models across supported providers...',
      startedAt: startTime,
      completedAt: null
    };

    const enabledAdapters = providerRegistry.getEnabledAdapters();
    if (enabledAdapters.length === 0) {
      this.isSyncRunning = false;
      this.currentProgress.stage = 'completed';
      this.currentProgress.completedAt = new Date().toISOString();
      this.currentProgress.message = 'No model providers currently enabled with API keys.';
      return {
        success: true,
        modelsDiscovered: 0,
        newModelsDetected: 0,
        updatedModelsDetected: 0,
        deprecatedModelsDetected: 0,
        message: 'No providers enabled. Configure provider API keys in environment.'
      };
    }

    const allDiscoveredModels: DiscoveredModel[] = [];
    const newlyDetectedModels: AiModelRecord[] = [];

    // Phase 1: Query each enabled provider
    for (const adapter of enabledAdapters) {
      this.currentProgress.currentProvider = adapter.displayName;
      this.currentProgress.message = `Querying ${adapter.displayName} catalog...`;

      try {
        const cacheEntry = this.catalogCache.get(adapter.providerName);
        let models: DiscoveredModel[] = [];

        if (!forceRefresh && cacheEntry && (Date.now() - cacheEntry.cachedAt < this.CACHE_TTL_MS)) {
          models = cacheEntry.models;
          logger.info(`Using cached catalog for [${adapter.providerName}] (${models.length} models)`);
        } else {
          models = await adapter.listModels();
          this.catalogCache.set(adapter.providerName, {
            models,
            cachedAt: Date.now()
          });
          logger.info(`Discovered ${models.length} live models from [${adapter.providerName}]`);
        }

        allDiscoveredModels.push(...models);
        this.currentProgress.modelsDiscovered = allDiscoveredModels.length;
      } catch (err: any) {
        logger.error(`PROVIDER_SYNC_FAILED: Provider [${adapter.providerName}] failed during sync`, {
          error: err.message
        });
        // Continue processing other healthy providers
      }
    }

    // Phase 2: Compare with Database & Detect Changes
    this.currentProgress.stage = 'detecting_changes';
    this.currentProgress.message = 'Comparing discovered models with database...';

    const now = new Date().toISOString();

    for (const discovered of allDiscoveredModels) {
      const id = `${discovered.provider.toLowerCase()}:${discovered.modelId.toLowerCase()}`;
      const existing = await AiModelDao.findById(id);

      if (!existing) {
        // GENUINELY NEW MODEL DETECTED
        this.currentProgress.newModelsDetected++;
        logger.info(`MODEL_DISCOVERED: [${id}] from [${discovered.provider}]`);

        const newRecord: AiModelRecord = {
          id,
          provider: discovered.provider,
          modelId: discovered.modelId,
          displayName: discovered.displayName,
          family: discovered.family,
          version: discovered.version,
          aliases: discovered.aliases || [],
          description: discovered.description || '',
          capabilities: discovered.capabilities,
          modalities: discovered.modalities || { input: ['text'], output: ['text'] },
          contextWindow: discovered.contextWindow,
          maxOutputTokens: discovered.maxOutputTokens,
          inputPricing: discovered.inputPricing,
          outputPricing: discovered.outputPricing,
          releaseDate: discovered.releaseDate,
          knowledgeCutoff: discovered.knowledgeCutoff,
          status: 'NEW',
          documentationUrl: discovered.documentationUrl,
          apiUrl: discovered.apiUrl,
          sourceUrl: discovered.sourceUrl,
          repositoryUrl: discovered.repositoryUrl,
          official: discovered.official,
          firstSeenAt: now,
          lastSeenAt: now,
          lastCheckedAt: now,
          lastResearchedAt: null,
          researchStatus: 'pending',
          freshness: 'Fresh',
          metadata: discovered.raw || {},
          evidence: [],
          history: [{
            id: uuidv4(),
            timestamp: now,
            changeType: 'DISCOVERED',
            description: `Model discovered dynamically from official ${discovered.provider.toUpperCase()} API catalog.`,
            sourceUrl: discovered.documentationUrl || undefined
          }]
        };

        await AiModelDao.upsert(newRecord);
        newlyDetectedModels.push(newRecord);

        // Record User-facing Notification
        const notification: ModelNotification = {
          id: uuidv4(),
          type: 'NEW_MODEL',
          title: `New Model: ${discovered.displayName}`,
          message: `${discovered.provider.toUpperCase()} released ${discovered.displayName}. Automated research queued.`,
          provider: discovered.provider,
          modelId: discovered.modelId,
          timestamp: now,
          read: false
        };
        await AiModelDao.recordNotification(notification);

      } else {
        // MODEL ALREADY IN DATABASE - CHECK FOR METADATA CHANGES
        const changes: ModelHistoryItem[] = [];

        // Check context window
        if (discovered.contextWindow && discovered.contextWindow !== existing.contextWindow) {
          changes.push({
            id: uuidv4(),
            timestamp: now,
            changeType: 'METADATA_UPDATED',
            field: 'contextWindow',
            oldValue: existing.contextWindow,
            newValue: discovered.contextWindow,
            description: `Context window updated: ${existing.contextWindow?.toLocaleString() || 'Unknown'} → ${discovered.contextWindow.toLocaleString()} tokens`,
            sourceUrl: discovered.documentationUrl || undefined
          });
          existing.contextWindow = discovered.contextWindow;
        }

        // Check pricing
        if (discovered.inputPricing !== null && discovered.inputPricing !== existing.inputPricing) {
          changes.push({
            id: uuidv4(),
            timestamp: now,
            changeType: 'METADATA_UPDATED',
            field: 'inputPricing',
            oldValue: existing.inputPricing,
            newValue: discovered.inputPricing,
            description: `Input pricing updated: $${existing.inputPricing ?? 0} → $${discovered.inputPricing} / 1M tokens`,
            sourceUrl: discovered.documentationUrl || undefined
          });
          existing.inputPricing = discovered.inputPricing;
        }

        // Check deprecation
        if (discovered.status === 'DEPRECATED' && existing.status !== 'DEPRECATED') {
          this.currentProgress.deprecatedModelsDetected++;
          changes.push({
            id: uuidv4(),
            timestamp: now,
            changeType: 'DEPRECATED',
            field: 'status',
            oldValue: existing.status,
            newValue: 'DEPRECATED',
            description: `Model officially marked deprecated by provider.`,
            sourceUrl: discovered.documentationUrl || undefined
          });
          existing.status = 'DEPRECATED';

          await AiModelDao.recordNotification({
            id: uuidv4(),
            type: 'MODEL_DEPRECATED',
            title: `Model Deprecated: ${existing.displayName}`,
            message: `${existing.provider.toUpperCase()} has deprecated ${existing.displayName}.`,
            provider: existing.provider,
            modelId: existing.modelId,
            timestamp: now,
            read: false
          });
        }

        // Check new capabilities detected
        const newCaps = discovered.capabilities.filter(c => !existing.capabilities.includes(c));
        if (newCaps.length > 0) {
          changes.push({
            id: uuidv4(),
            timestamp: now,
            changeType: 'METADATA_UPDATED',
            field: 'capabilities',
            oldValue: existing.capabilities,
            newValue: [...existing.capabilities, ...newCaps],
            description: `New verified capabilities added: ${newCaps.join(', ')}`,
            sourceUrl: discovered.documentationUrl || undefined
          });
          existing.capabilities = Array.from(new Set([...existing.capabilities, ...newCaps]));
        }

        if (changes.length > 0) {
          this.currentProgress.updatedModelsDetected++;
          logger.info(`MODEL_UPDATED: [${id}] - ${changes.length} change(s) detected`);
          existing.status = existing.status === 'DEPRECATED' ? 'DEPRECATED' : 'UPDATED';
          existing.history = existing.history || [];
          existing.history.unshift(...changes);

          await AiModelDao.recordNotification({
            id: uuidv4(),
            type: 'MODEL_UPDATED',
            title: `Model Updated: ${existing.displayName}`,
            message: changes.map(c => c.description).join('; '),
            provider: existing.provider,
            modelId: existing.modelId,
            timestamp: now,
            read: false
          });
        }

        // Update timestamps
        existing.lastSeenAt = now;
        existing.lastCheckedAt = now;
        await AiModelDao.upsert(existing);
      }
    }

    // Phase 3: Automatic Autonomous Research Queue for New Models
    if (newlyDetectedModels.length > 0) {
      this.currentProgress.stage = 'researching';
      this.currentProgress.totalToResearch = newlyDetectedModels.length;
      this.currentProgress.message = `Queuing autonomous research for ${newlyDetectedModels.length} new model(s)...`;

      // Enqueue to research worker with controlled concurrency (Section 39)
      for (const m of newlyDetectedModels) {
        modelResearchQueue.enqueue(m.provider, m.modelId);
      }

      // Check newly detected models against existing saved user requirements
      modelRecommendationService.checkNewModelsAgainstSavedUseCases(newlyDetectedModels).catch(err => {
        logger.warn('Failed checking new models against saved use cases', { error: err.message });
      });
    }

    const completedAt = new Date().toISOString();
    this.lastSyncCompletedAt = completedAt;
    this.currentProgress.stage = 'completed';
    this.currentProgress.completedAt = completedAt;
    this.currentProgress.message = `Sync completed: ${allDiscoveredModels.length} models tracked, ${this.currentProgress.newModelsDetected} new, ${this.currentProgress.updatedModelsDetected} updated.`;
    this.isSyncRunning = false;

    logger.info('MODEL_DISCOVERY_COMPLETED', {
      modelsDiscovered: allDiscoveredModels.length,
      newModelsDetected: this.currentProgress.newModelsDetected,
      updatedModelsDetected: this.currentProgress.updatedModelsDetected,
      completedAt
    });

    return {
      success: true,
      modelsDiscovered: allDiscoveredModels.length,
      newModelsDetected: this.currentProgress.newModelsDetected,
      updatedModelsDetected: this.currentProgress.updatedModelsDetected,
      deprecatedModelsDetected: this.currentProgress.deprecatedModelsDetected,
      message: this.currentProgress.message
    };
  }
}

export const modelDiscoveryService = new ModelDiscoveryService();
