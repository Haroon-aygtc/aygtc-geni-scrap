import express from 'express';
import {
  getAllModerationRules,
  getModerationRuleById,
  createModerationRule,
  updateModerationRule,
  deleteModerationRule,
} from '../controllers/moderationRuleController';

const router = express.Router();

router.get('/', getAllModerationRules);
router.get('/:id', getModerationRuleById);
router.post('/', createModerationRule);
router.put('/:id', updateModerationRule);
router.delete('/:id', deleteModerationRule);

export default router;
