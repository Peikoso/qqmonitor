import express from 'express';
import { RunnersController, RunnerLogsController, RunnerQueueController } from '../controllers/runners.js';

const router = express.Router();

router.get('/', RunnersController.getAllRunners);

router.get('/queue', RunnerQueueController.getAllRunnerQueue);

router.get('/logs', RunnerLogsController.getAllRunnersLogs);

export default router;