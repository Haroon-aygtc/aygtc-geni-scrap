import express from 'express';
import {
  getAllAnalyticsLogs,
  getAnalyticsLogById,
  createAnalyticsLog,
  updateAnalyticsLog,
  deleteAnalyticsLog,
} from '../controllers/analyticsLogController';

const router = express.Router();

router.get('/', getAllAnalyticsLogs);
router.get('/:id', getAnalyticsLogById);
router.post('/', createAnalyticsLog);
router.put('/:id', updateAnalyticsLog);
router.delete('/:id', deleteAnalyticsLog);

export default router;
