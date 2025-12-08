import { pool } from '../config/database-conn.js';
import { EscalationPolicy } from '../models/escalation-policies.js'

export const EscalationPoliciesRepository = {
    find: async () => {
        const result = await pool.query(
            `
            SELECT * FROM escalation_policy
            LIMIT 1;
            `
        );

        if(!result.rows[0]) {
            return null;
        }

        return new EscalationPolicy(result.rows[0]);
    },

    create: async(escalationPolicy) => {
        const insertQuery =
        `
        INSERT INTO escalation_policy
        (timeout_ms)
        VALUES ($1)
        RETURNING *;
        `;

        const values = [
            escalationPolicy.timeoutMs, 
        ];

        const result = await pool.query(insertQuery, values);

        return new EscalationPolicy(result.rows[0]);
    },

    update: async(escalationPolicy) => {
        const updateQuery =
        `
        UPDATE escalation_policy
        SET timeout_ms = $1,
            updated_at = $2
        WHERE id = $3
        RETURNING *;
        `;

        const values = [
            escalationPolicy.timeoutMs,
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