import express from 'express';
import { DBTestController } from '../controllers/db-test.js';

const router = express.Router();

router.get('/', DBTestController.testDatabaseConnection);

export default router;