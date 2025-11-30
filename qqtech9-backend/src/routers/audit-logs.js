import express from 'express';
import { AuditLogsController } from '../controllers/audit-logs.js';

const router = express.Router();

router.get('/', AuditLogsController.getAllAuditLogs);
router.post('/', AuditLogsController.createAuditLog);

export default router;