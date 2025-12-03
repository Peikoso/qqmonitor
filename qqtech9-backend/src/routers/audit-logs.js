import express from 'express';
import { AuditLogsController } from '../controllers/audit-logs.js';

const router = express.Router();

router.get('/', AuditLogsController.getAllAuditLogs);


export default router;