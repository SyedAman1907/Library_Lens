import { Router } from 'express';
import { ModelController } from '../../controllers/model.controller.js';
import { RecommendationController } from '../../controllers/recommendation.controller.js';

const router = Router();

// Stats & Radar
router.get('/radar', ModelController.getRadarStats);

// Sync endpoints
router.get('/sync/status', ModelController.getSyncStatus);
router.post('/sync', ModelController.triggerSync);

// Notifications
router.get('/notifications', ModelController.getNotifications);
router.put('/notifications/:id/read', ModelController.markNotificationRead);

// Comparison
router.post('/compare', ModelController.compareModels);

// Recommendation Engine Endpoints
router.post('/recommendations/analyze', RecommendationController.analyzeAndRecommend);
router.get('/recommendations/analysis/:id', RecommendationController.getAnalysis);
router.post('/recommendations/:id/challenge', RecommendationController.challengeRecommendation);
router.post('/recommendations/:id/refresh', RecommendationController.refreshRecommendation);
router.get('/recommendations/saved-use-cases', RecommendationController.listSavedUseCases);
router.post('/recommendations/saved-use-cases', RecommendationController.saveUseCase);
router.delete('/recommendations/saved-use-cases/:id', RecommendationController.deleteUseCase);
router.get('/recommendations/saved-use-cases/:id/check-updates', RecommendationController.checkUseCaseUpdates);

// Model list
router.get('/', ModelController.listModels);

// Single model operations (must come after literal subpaths)
router.get('/:provider/:modelId', ModelController.getModelDetails);
router.post('/:provider/:modelId/research', ModelController.forceResearchModel);
router.get('/:provider/:modelId/history', ModelController.getModelHistory);

export default router;
