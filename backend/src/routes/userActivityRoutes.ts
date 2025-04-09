import { Router } from 'express';
import * as activityController from '../controllers/userActivityController.js';

const router = Router();

router.get('/', activityController.getUserActivities);
router.post('/', activityController.createUserActivity);

export default router;
