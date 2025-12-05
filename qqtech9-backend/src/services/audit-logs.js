import { AuditLogs } from "../models/audit-logs.js";
import { AuditLogsRepository } from "../repositories/audit-logs.js";

export const AuditLogService = {
    getAllAuditLogs: async () => {
        const auditLogs = await AuditLogsRepository.findAll();

        return auditLogs;
    },

    createAuditLog: async (auditLogData, client) => {
        const auditLog = new AuditLogs(auditLogData).validateBusinessLogic();

        const savedAuditLog = await AuditLogsRepository.create(auditLog, client);

        return savedAuditLog;
    },

};