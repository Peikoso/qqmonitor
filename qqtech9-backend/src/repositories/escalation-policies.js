import { pool } from '../config/database-conn.js';
import { EscalationPolicy } from '../models/escalation-policies.js'

export const EscalationPoliciesRepository = {
    findAll: async () => {
        const result = await pool.query(
            `
            SELECT * FROM escalation_policy
            ORDER BY created_at DESC;
            `
        );

        return EscalationPolicy.fromArray(result.rows);
    },

    findById: async (id) => {
        const selectByIdQuery =
        `
        SELECT * FROM escalation_policy
        WHERE id = $1
        `;

        const result = await pool.query(selectByIdQuery, [id]);

        if (!result.rows[0]) {
            return null;
        }

        return new EscalationPolicy(result.rows[0]);
    },

    create: async(escalationPolicy) => {
        const insertQuery =
        `
        INSERT INTO escalation_policy
        (timeout_ms, role_id, is_active)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;

        const values = [
            escalationPolicy.timeoutMs, 
            escalationPolicy.roleId, 
            escalationPolicy.isActive
        ];

        const result = await pool.query(insertQuery, values);

        return new EscalationPolicy(result.rows[0]);
    },

    update: async(escalationPolicy) => {
        const updateQuery =
        `
        UPDATE escalation_policy
        SET timeout_ms = $1,
            role_id = $2,
            is_active = $3,
            updated_at = $4
        WHERE id = $5
        RETURNING *;
        `;

        const values = [
            escalationPolicy.timeoutMs,
            escalationPolicy.roleId,
            escalationPolicy.isActive,
            escalationPolicy.updatedAt,
            escalationPolicy.id
        ];

        const result = await pool.query(updateQuery, values);

        return new EscalationPolicy(result.rows[0]);
    },

    delete: async(id) => {
        const deleteQuery = 
        `
        DELETE FROM escalation_policy
        WHERE id = $1;
        `;
        
        await pool.query(deleteQuery, [id]);
    },
}