import { AuditLogService } from '../services/audit-logs.js';
import { CreateAuditLogsDto } from '../dto/audit_logs/create-audit-logs-dto.js';
import { ResponseAuditLogsDto } from '../dto/audit_logs/response-audit-logs-dto.js';

export const AuditLogsController = {
    getAllAuditLogs: async (req, res) => {
        const auditLogs = await AuditLogService.getAllAuditLogs();

        const response = ResponseAuditLogsDto.fromArray(auditLogs);

        return res.status(200).json(response);
    },

    createAuditLog: async (req, res) => {
        const auditLogData = req.body;

        const dto = new CreateAuditLogsDto(auditLogData).validate();

        const newAuditLog = await AuditLogService.createAuditLog(dto);

        const response = new ResponseAuditLogsDto(newAuditLog);

        return res.status(201).json(response);
    },
};