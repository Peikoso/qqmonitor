import express from 'express';
import { MetricsController } from '../controllers/metrics.js';

const router = express.Router();

router.get('/basic', MetricsController.getBasicMetrics);

export default router;