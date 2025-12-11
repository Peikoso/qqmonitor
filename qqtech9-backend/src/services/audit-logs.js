import { AuditLogs } from "../models/audit-logs.js";
import { AuditLogsRepository } from "../repositories/audit-logs.js";
import { AuthService } from "./auth.js";
import { UserService } from "./users.js";

export const AuditLogService = {
    getAllAuditLogs: async (currentUserFirebaseUid, page, perPage) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(user);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const auditLogs = await AuditLogsRepository.findAll();

        return auditLogs;
    },

    createAuditLog: async (auditLogData, client) => {
        const auditLog = new AuditLogs(auditLogData).validateBusinessLogic();

        const savedAuditLog = await AuditLogsRepository.create(auditLog, client);

        return savedAuditLog;
    },

};