import express from 'express';
import {
  getAllFollowUpConfigs,
  getFollowUpConfigById,
  createFollowUpConfig,
  updateFollowUpConfig,
  deleteFollowUpConfig,
  createPredefinedQuestionSet,
  updatePredefinedQuestionSet,
  deletePredefinedQuestionSet,
  createTopicBasedQuestionSet,
  updateTopicBasedQuestionSet,
  deleteTopicBasedQuestionSet,
} from '../controllers/followUpConfigController';

const router = express.Router();

// FollowUpConfig CRUD
router.get('/', getAllFollowUpConfigs);
router.get('/:id', getFollowUpConfigById);
router.post('/', createFollowUpConfig);
router.put('/:id', updateFollowUpConfig);
router.delete('/:id', deleteFollowUpConfig);

// PredefinedQuestionSet nested CRUD
router.post('/:configId/predefined-question-sets', createPredefinedQuestionSet);
router.put('/predefined-question-sets/:id', updatePredefinedQuestionSet);
router.delete('/predefined-question-sets/:id', deletePredefinedQuestionSet);

// TopicBasedQuestionSet nested CRUD
router.post('/:configId/topic-based-question-sets', createTopicBasedQuestionSet);
router.put('/topic-based-question-sets/:id', updateTopicBasedQuestionSet);
router.delete('/topic-based-question-sets/:id', deleteTopicBasedQuestionSet);

export default router;
