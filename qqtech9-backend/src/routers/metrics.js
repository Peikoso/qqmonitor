import express from 'express';
import { MetricsController } from '../controllers/metrics.js';

const router = express.Router();

router.get('/basic', MetricsController.getBasicMetrics);
router.get('/:startDate/:endDate', MetricsController.getMetrics);

export default router;