import { Router } from 'express';
import { getLibraryDetails, getLibraryReleases } from '../../controllers/library.controller.js';

const router = Router();

router.get('/:name', getLibraryDetails);
router.get('/:name/releases', getLibraryReleases);

export default router;
