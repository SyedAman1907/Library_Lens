import { Request, Response } from 'express';
import { AiModelDao } from '../models/ai_model.schema.js';
import { modelDiscoveryService } from '../services/model_discovery.service.js';
import { modelResearchQueue } from '../services/model_research_queue.service.js';
import { providerRegistry } from '../models/providers/provider.registry.js';
import { ModelRadarStats } from '../types/model.types.js';
import { logger } from '../utils/logger.js';

export class ModelController {
  // GET /api/models
  static async listModels(req: Request, res: Response) {
    try {
      const { provider, status, capability, search } = req.query;
      const models = await AiModelDao.listAll({
        provider: typeof provider === 'string' ? provider : undefined,
        status: typeof status === 'string' ? status : undefined,
        capability: typeof capability === 'string' ? capability : undefined,
        search: typeof search === 'string' ? search : undefined
      });
      res.json({ total: models.length, models });
    } catch (err: any) {
      logger.error('Failed to list models', { error: err.message });
      res.status(500).json({ error: 'Failed to retrieve models', message: err.message });
    }
  }

  // GET /api/models/radar
  static async getRadarStats(req: Request, res: Response) {
    try {
      const all = await AiModelDao.listAll();
      const providersHealth = await providerRegistry.checkAllHealth();

      const newCount = all.filter(m => m.status === 'NEW').length;
      const updatedCount = all.filter(m => m.status === 'UPDATED').length;
      const activeCount = all.filter(m => m.status === 'ACTIVE').length;
      const deprecatedCount = all.filter(m => m.status === 'DEPRECATED').length;
      const recentlyResearchedCount = all.filter(m => m.researchStatus === 'completed').length;

      const radarStats: ModelRadarStats = {
        totalTracked: all.length,
        newCount,
        updatedCount,
        activeCount,
        deprecatedCount,
        recentlyResearchedCount,
        lastSynchronizedAt: modelDiscoveryService.getLastSyncTime(),
        isSyncInProgress: modelDiscoveryService.isSyncInProgress(),
        providers: providersHealth
      };

      res.json(radarStats);
    } catch (err: any) {
      logger.error('Failed to get radar stats', { error: err.message });
      res.status(500).json({ error: 'Failed to retrieve radar stats', message: err.message });
    }
  }

  // GET /api/models/sync/status
  static getSyncStatus(req: Request, res: Response) {
    res.json(modelDiscoveryService.getProgress());
  }

  // POST /api/models/sync
  static async triggerSync(req: Request, res: Response) {
    try {
      if (modelDiscoveryService.isSyncInProgress()) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Synchronization already in progress.'
        });
        return;
      }

      const forceRefresh = req.body?.force === true;

      // Start asynchronous synchronization
      modelDiscoveryService.runSync(forceRefresh).catch(err => {
        logger.error('Manual model sync background error', { error: err.message });
      });

      res.status(202).json({
        message: 'Model synchronization initiated',
        status: modelDiscoveryService.getProgress()
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to initiate sync', message: err.message });
    }
  }

  // GET /api/models/notifications
  static async getNotifications(req: Request, res: Response) {
    try {
      const notifications = await AiModelDao.getNotifications();
      res.json({ notifications });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get notifications', message: err.message });
    }
  }

  // PUT /api/models/notifications/:id/read
  static async markNotificationRead(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await AiModelDao.markNotificationRead(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to mark notification read', message: err.message });
    }
  }

  // GET /api/models/:provider/:modelId
  static async getModelDetails(req: Request, res: Response) {
    try {
      const provider = String(req.params.provider);
      const modelId = String(req.params.modelId);
      const model = await AiModelDao.findByProviderAndModel(provider, modelId);
      if (!model) {
        res.status(404).json({ error: 'Not Found', message: `Model ${provider}:${modelId} not found` });
        return;
      }
      res.json(model);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve model', message: err.message });
    }
  }

  // POST /api/models/:provider/:modelId/research
  static async forceResearchModel(req: Request, res: Response) {
    try {
      const provider = String(req.params.provider);
      const modelId = String(req.params.modelId);
      const model = await AiModelDao.findByProviderAndModel(provider, modelId);
      if (!model) {
        res.status(404).json({ error: 'Not Found', message: `Model ${provider}:${modelId} not found` });
        return;
      }

      modelResearchQueue.enqueue(provider, modelId, true);
      res.status(202).json({ message: `Research queued for ${provider}:${modelId}` });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to queue research', message: err.message });
    }
  }

  // GET /api/models/:provider/:modelId/history
  static async getModelHistory(req: Request, res: Response) {
    try {
      const provider = String(req.params.provider);
      const modelId = String(req.params.modelId);
      const model = await AiModelDao.findByProviderAndModel(provider, modelId);
      if (!model) {
        res.status(404).json({ error: 'Not Found', message: `Model ${provider}:${modelId} not found` });
        return;
      }
      res.json({ history: model.history || [] });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve history', message: err.message });
    }
  }

  // POST /api/models/compare
  static async compareModels(req: Request, res: Response) {
    try {
      const { modelA, modelB } = req.body;
      if (!modelA || !modelB) {
        res.status(400).json({ error: 'Bad Request', message: 'modelA and modelB identifiers required (e.g. google:gemini-1.5-pro)' });
        return;
      }

      const [recordA, recordB] = await Promise.all([
        AiModelDao.findById(modelA.toLowerCase()),
        AiModelDao.findById(modelB.toLowerCase())
      ]);

      if (!recordA || !recordB) {
        res.status(404).json({
          error: 'Not Found',
          message: `One or both models not found: [${modelA}: ${!!recordA}, ${modelB}: ${!!recordB}]`
        });
        return;
      }

      // Compute capability diff
      const capsA = new Set(recordA.capabilities);
      const capsB = new Set(recordB.capabilities);
      const sharedCapabilities = recordA.capabilities.filter(c => capsB.has(c));
      const onlyInA = recordA.capabilities.filter(c => !capsB.has(c));
      const onlyInB = recordB.capabilities.filter(c => !capsA.has(c));

      res.json({
        modelA: recordA,
        modelB: recordB,
        comparison: {
          contextRatio: (recordA.contextWindow && recordB.contextWindow) ? (recordA.contextWindow / recordB.contextWindow).toFixed(2) : null,
          sharedCapabilities,
          onlyInA,
          onlyInB,
          pricingComparison: {
            inputA: recordA.inputPricing,
            inputB: recordB.inputPricing,
            outputA: recordA.outputPricing,
            outputB: recordB.outputPricing
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to compare models', message: err.message });
    }
  }
}
