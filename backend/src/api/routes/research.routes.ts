import { Router } from 'express';
import {
  startResearch,
  getResearch,
  refreshResearch,
  getResearchSources,
  getResearchEvidenceHandler,
  getResearchClaimsHandler,
  challengeClaimHandler,
  getResearchVersionsHandler,
  replayResearchHandler,
  streamResearchProgress,
  listResearchHistory,
  deleteResearch
} from '../../controllers/research.controller.js';

const router = Router();

router.get('/', listResearchHistory);
router.post('/', startResearch);
router.get('/stream/:id', streamResearchProgress);
router.get('/:id', getResearch);
router.delete('/:id', deleteResearch);
router.post('/:id/refresh', refreshResearch);
router.get('/:id/sources', getResearchSources);
router.get('/:id/evidence', getResearchEvidenceHandler);
router.get('/:id/claims', getResearchClaimsHandler);
router.post('/:id/claims/:claimId/challenge', challengeClaimHandler);
router.get('/:id/versions', getResearchVersionsHandler);
router.post('/:id/replay', replayResearchHandler);

export default router;
