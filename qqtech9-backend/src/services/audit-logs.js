import { AuditLogs } from "../models/audit-logs.js";
import { AuditLogsRepository } from "../repositories/audit-logs.js";
import { UserService } from "./users.js";

export const AuditLogService = {
    getAllAuditLogs: async () => {
        const auditLogs = await AuditLogsRepository.findAll();

        return auditLogs;
    },

    createAuditLog: async (dto) => {
        const auditLog = new AuditLogs(dto).validateBusinessLogic();

        await UserService.getUserById(auditLog.userId);

        const savedAuditLog = await AuditLogsRepository.create(auditLog);

        return savedAuditLog;
    },

};