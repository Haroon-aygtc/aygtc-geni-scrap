import express from 'express';
import {
  getAllKnowledgeBaseEntries,
  getKnowledgeBaseEntryById,
  createKnowledgeBaseEntry,
  updateKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
} from '../controllers/knowledgeBaseController';

const router = express.Router();

router.get('/', getAllKnowledgeBaseEntries);
router.get('/:id', getKnowledgeBaseEntryById);
router.post('/', createKnowledgeBaseEntry);
router.put('/:id', updateKnowledgeBaseEntry);
router.delete('/:id', deleteKnowledgeBaseEntry);

export default router;
