import { Router } from 'express';
import * as aiCacheController from '../controllers/aiCacheController.js';

const router = Router();

router.get('/', aiCacheController.getAllAICache);
router.get('/:id', aiCacheController.getAICacheById);
router.post('/', aiCacheController.createAICache);
router.put('/:id', aiCacheController.updateAICache);
router.delete('/:id', aiCacheController.deleteAICache);

export default router;
