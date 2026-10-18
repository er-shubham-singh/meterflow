import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/company-dashboard', analyticsController.getCompanyDashboard);
router.get('/platform-overview', analyticsController.getPlatformOverview);

export default router;
