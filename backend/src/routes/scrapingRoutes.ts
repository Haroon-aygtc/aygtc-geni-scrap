import express from 'express';
import {
  getAllScrapingJobs,
  getScrapingJobById,
  createScrapingJob,
  updateScrapingJob,
  deleteScrapingJob,
  getAllScrapingSelectors,
  getScrapingSelectorById,
  createScrapingSelector,
  updateScrapingSelector,
  deleteScrapingSelector,
  getAllScrapingData,
  getScrapingDataById,
  createScrapingData,
  updateScrapingData,
  deleteScrapingData,
} from '../controllers/scrapingController';

const router = express.Router();

// ScrapingJob
router.get('/jobs', getAllScrapingJobs);
router.get('/jobs/:id', getScrapingJobById);
router.post('/jobs', createScrapingJob);
router.put('/jobs/:id', updateScrapingJob);
router.delete('/jobs/:id', deleteScrapingJob);

// ScrapingSelector
router.get('/selectors', getAllScrapingSelectors);
router.get('/selectors/:id', getScrapingSelectorById);
router.post('/selectors', createScrapingSelector);
router.put('/selectors/:id', updateScrapingSelector);
router.delete('/selectors/:id', deleteScrapingSelector);

// ScrapingData
router.get('/data', getAllScrapingData);
router.get('/data/:id', getScrapingDataById);
router.post('/data', createScrapingData);
router.put('/data/:id', updateScrapingData);
router.delete('/data/:id', deleteScrapingData);

export default router;
