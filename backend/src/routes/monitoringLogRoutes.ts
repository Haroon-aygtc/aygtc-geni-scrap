import express from 'express';
import {
  getAllMonitoringLogs,
  getMonitoringLogById,
  createMonitoringLog,
  updateMonitoringLog,
  deleteMonitoringLog,
} from '../controllers/monitoringLogController';

const router = express.Router();

router.get('/', getAllMonitoringLogs);
router.get('/:id', getMonitoringLogById);
router.post('/', createMonitoringLog);
router.put('/:id', updateMonitoringLog);
router.delete('/:id', deleteMonitoringLog);

export default router;
