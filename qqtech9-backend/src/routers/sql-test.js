import express from 'express';
import { SQLTestsController } from '../controllers/sql-test.js';

const router = express.Router();

router.get('/', SQLTestsController.getAllSQLTests);
router.post('/', SQLTestsController.createSQLTest);

export default router;