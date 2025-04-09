import express from 'express';
import {
  getAllChatSessions,
  getChatSessionById,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  createChatMessage,
  updateChatMessage,
  deleteChatMessage,
} from '../controllers/chatController';

const router = express.Router();

// ChatSession CRUD
router.get('/', getAllChatSessions);
router.get('/:id', getChatSessionById);
router.post('/', createChatSession);
router.put('/:id', updateChatSession);
router.delete('/:id', deleteChatSession);

// ChatMessage nested CRUD
router.post('/:sessionId/messages', createChatMessage);
router.put('/messages/:id', updateChatMessage);
router.delete('/messages/:id', deleteChatMessage);

export default router;
