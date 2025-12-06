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
        (timeout_ms, is_active)
        VALUES ($1, $2)
        RETURNING *;
        `;

        const values = [
            escalationPolicy.timeoutMs, 
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
            is_active = $2,
            updated_at = $3
        WHERE id = $4
        RETURNING *;
        `;

        const values = [
            escalationPolicy.timeoutMs,
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