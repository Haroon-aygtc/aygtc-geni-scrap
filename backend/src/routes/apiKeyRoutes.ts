import express from 'express';
import {
  getAllApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from '../controllers/apiKeyController';

const router = express.Router();

router.get('/', getAllApiKeys);
router.get('/:id', getApiKeyById);
router.post('/', createApiKey);
router.put('/:id', updateApiKey);
router.delete('/:id', deleteApiKey);

export default router;
