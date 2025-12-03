import { AuditLogService } from '../services/audit-logs.js';
import { ResponseAuditLogsDto } from '../dto/audit_logs/response-audit-logs-dto.js';

export const AuditLogsController = {
    getAllAuditLogs: async (req, res) => {
        const auditLogs = await AuditLogService.getAllAuditLogs();

        const response = ResponseAuditLogsDto.fromArray(auditLogs);

        return res.status(200).json(response);
    },
};