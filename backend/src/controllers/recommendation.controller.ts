import { Request, Response } from 'express';
import { modelRecommendationService } from '../services/model_recommendation.service.js';
import { RecommendationDao } from '../models/recommendation.schema.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class RecommendationController {
  // POST /api/models/recommendations/analyze
  static async analyzeAndRecommend(req: Request, res: Response) {
    try {
      const { prompt, constraints } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({ error: 'Bad Request', message: 'A natural language requirement prompt is required.' });
        return;
      }

      logger.info('Analyzing user requirements for model recommendation', { prompt });
      const analysis = await modelRecommendationService.analyzeAndRecommend({
        prompt: prompt.trim(),
        constraints
      });

      res.status(200).json(analysis);
    } catch (err: any) {
      logger.error('Failed to generate recommendation', { error: err.message });
      res.status(500).json({ error: 'Failed to generate recommendation', message: err.message });
    }
  }

  // GET /api/models/recommendations/analysis/:id
  static async getAnalysis(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const analysis = await RecommendationDao.getAnalysisById(id);
      if (!analysis) {
        res.status(404).json({ error: 'Not Found', message: `Analysis [${id}] not found.` });
        return;
      }
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve analysis', message: err.message });
    }
  }

  // POST /api/models/recommendations/:id/challenge
  static async challengeRecommendation(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await modelRecommendationService.challengeRecommendation(id);
      res.status(200).json(result);
    } catch (err: any) {
      logger.error('Failed to challenge recommendation', { error: err.message });
      res.status(500).json({ error: 'Failed to challenge recommendation', message: err.message });
    }
  }

  // POST /api/models/recommendations/:id/refresh
  static async refreshRecommendation(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await modelRecommendationService.refreshRecommendation(id);
      res.status(200).json(result);
    } catch (err: any) {
      logger.error('Failed to refresh recommendation', { error: err.message });
      res.status(500).json({ error: 'Failed to refresh recommendation', message: err.message });
    }
  }

  // GET /api/models/recommendations/saved-use-cases
  static async listSavedUseCases(req: Request, res: Response) {
    try {
      const useCases = await modelRecommendationService.listSavedUseCases();
      res.json({ total: useCases.length, useCases });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve saved use cases', message: err.message });
    }
  }

  // POST /api/models/recommendations/saved-use-cases
  static async saveUseCase(req: Request, res: Response) {
    try {
      const { id, name, prompt, requirements, currentRecommendedModelIds } = req.body;
      if (!name || !prompt) {
        res.status(400).json({ error: 'Bad Request', message: 'name and prompt are required to save a use case.' });
        return;
      }

      const useCaseId = id || `usecase_${uuidv4().slice(0, 8)}`;
      const now = new Date().toISOString();

      const existing = await modelRecommendationService.getUseCaseById(useCaseId);

      const useCase = {
        id: useCaseId,
        name: name.trim(),
        prompt: prompt.trim(),
        requirements: requirements || (await modelRecommendationService.extractRequirements({ prompt })),
        currentRecommendedModelIds: currentRecommendedModelIds || [],
        researchHistory: existing?.researchHistory || [],
        lastCheckedAt: now,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      };

      const saved = await modelRecommendationService.saveUseCase(useCase);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save use case', message: err.message });
    }
  }

  // DELETE /api/models/recommendations/saved-use-cases/:id
  static async deleteUseCase(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const deleted = await modelRecommendationService.deleteUseCase(id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete use case', message: err.message });
    }
  }

  // GET /api/models/recommendations/saved-use-cases/:id/check-updates
  static async checkUseCaseUpdates(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const useCase = await modelRecommendationService.getUseCaseById(id);
      if (!useCase) {
        res.status(404).json({ error: 'Not Found', message: `Saved use case [${id}] not found.` });
        return;
      }

      // Re-run analysis against this use case
      const analysis = await modelRecommendationService.analyzeAndRecommend({
        prompt: useCase.prompt,
        constraints: useCase.requirements
      });

      const newTopPick = analysis.recommendations[0]?.model?.id;
      const oldTopPick = useCase.currentRecommendedModelIds[0];
      const hasUpdate = newTopPick && oldTopPick && newTopPick !== oldTopPick;

      res.json({
        useCase,
        hasUpdate,
        previousTopModelId: oldTopPick,
        newTopModelId: newTopPick,
        analysis
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to check use case updates', message: err.message });
    }
  }
}
