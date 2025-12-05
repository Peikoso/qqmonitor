import { pool } from '../config/database-conn.js';
import { AuditLogs } from '../models/audit-logs.js';

export const AuditLogsRepository = {
    findAll: async () => {
        const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC');

        return AuditLogs.fromArray(result.rows);
    },

    create: async (auditLog, client = pool) => {
        const insertQuery = 
        `
        INSERT INTO audit_logs (entity_id, entity_type, action_type, old_value, new_value, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `;

        const values = [
            auditLog.entityId,
            auditLog.entityType,
            auditLog.actionType,
            auditLog.oldValue,
            auditLog.newValue,
            auditLog.userId
        ];

        const result = await client.query(insertQuery, values);

        return new AuditLogs(result.rows[0]);
    },
};