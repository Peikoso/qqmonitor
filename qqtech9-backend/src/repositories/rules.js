import { pool } from '../config/database-conn.js';
import { Rules } from '../models/rules.js';

export const RulesRepository = {
    findAll: async (
        name, priority, isSuperAdmin, databaseType, roles, roleId, limit, offset
    ) => {
        const selectQuery = `
        SELECT 
            r.*, 
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', ro.id,
                        'name', ro.name,
                        'color', ro.color
                    )
                ) FILTER (WHERE rr.role_id IS NOT NULL),
                '[]'::jsonb
            ) AS roles 
        FROM rules r 
        LEFT JOIN rules_roles rr 
            ON r.id = rr.rule_id
        LEFT JOIN roles ro
            ON rr.role_id = ro.id
        WHERE 
            ($1::varchar IS NULL OR r.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR r.priority = $2)
            AND ($3::varchar IS NULL OR r.database_type = $3)
            AND (
                $4::boolean = true
                OR (
                    $5::uuid[] IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM rules_roles rr_auth
                        WHERE rr_auth.rule_id = r.id
                        AND rr_auth.role_id = ANY($5::uuid[])
                    )
                )
            )
            AND (
                $6::uuid IS NULL 
                OR EXISTS (
                    SELECT 1 
                    FROM rules_roles rr_filter 
                    WHERE rr_filter.rule_id = r.id 
                    AND rr_filter.role_id = $6
                )
            )
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT $7 OFFSET $8;
        `;

        const values = [
            name || null,
            priority || null,
            databaseType || null,
            isSuperAdmin,
            roles?.length ? roles : null,
            roleId || null,
            limit,
            offset
        ];
        
        const result = await pool.query(selectQuery, values);

        return Rules.fromArray(result.rows);
    },

    findById: async (id) => {
        const selectIdQuery = 
        `
        SELECT 
            r.*, array_remove(array_agg(ro.id), NULL) AS roles 
        FROM rules r 
        LEFT JOIN rules_roles rr 
            ON r.id = rr.rule_id
        LEFT JOIN roles ro
            ON rr.role_id = ro.id
        WHERE r.id = $1
        GROUP BY r.id;
        `;

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Rules(result.rows[0]);
    },

    create: async (rule, client = pool) => {
        const insertRuleQuery = 
        `
        INSERT INTO rules
        (name, description, database_type, sql, priority, execution_interval_ms, max_error_count, timeout_ms, start_time, end_time, is_active, silence_mode, postpone_date, user_creator_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id; 
        `;
        
        const values = [
            rule.name,
            rule.description,
            rule.databaseType,
            rule.sql,
            rule.priority,
            rule.executionIntervalMs,
            rule.maxErrorCount,
            rule.timeoutMs,
            rule.startTime,
            rule.endTime,
            rule.isActive,
            rule.silenceMode,
            rule.postponeDate,
            rule.userCreatorId
        ];
        
        const ruleDB = await client.query(insertRuleQuery, values);

        const insertRoleRuleQuery = ` INSERT INTO rules_roles (rule_id, role_id) VALUES ($1, $2); `;

        for (const roleId of rule.roles) {
            await client.query(insertRoleRuleQuery, [ruleDB.rows[0].id, roleId]);
        }

        const ruleWithRolesQuery = 
        `
        SELECT r.*, array_remove(array_agg(rr.role_id), NULL) AS roles
        FROM rules r
        LEFT JOIN rules_roles rr 
        ON r.id = rr.rule_id
        WHERE r.id = $1
        GROUP BY r.id;
        `;

        const result = await client.query(ruleWithRolesQuery, [ruleDB.rows[0].id]);

        await client.query('COMMIT');
        
        return new Rules(result.rows[0]);
    },

    update: async (rule) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const updateRuleQuery = 
            `
            UPDATE rules
            SET name = $1,
                description = $2,
                sql = $3,
                priority = $4,
                execution_interval_ms = $5,
                max_error_count = $6,
                timeout_ms = $7,
                start_time = $8,
                end_time = $9,
                is_active = $10,
                silence_mode = $11,
                postpone_date = $12,
                updated_at = $13
            WHERE id = $14;
            `;

            const values = [
                rule.name,
                rule.description,
                rule.sql,
                rule.priority,
                rule.executionIntervalMs,
                rule.maxErrorCount,
                rule.timeoutMs,
                rule.startTime,
                rule.endTime,
                rule.isActive,
                rule.silenceMode,
                rule.postponeDate,
                rule.updatedAt,
                rule.id
            ];

            await client.query(updateRuleQuery, values);

            const deleteRolesQuery = ` DELETE FROM rules_roles WHERE rule_id = $1; `;
            await client.query(deleteRolesQuery, [rule.id]);

            const insertRoleRuleQuery = ` INSERT INTO rules_roles (rule_id, role_id) VALUES ($1, $2); `;

            for (const roleId of rule.roles) {
                await client.query(insertRoleRuleQuery, [rule.id, roleId]);
            }

            const ruleWithRolesQuery = 
            `
            SELECT r.*, array_remove(array_agg(rr.role_id), NULL) AS roles
            FROM rules r
            LEFT JOIN rules_roles rr 
            ON r.id = rr.rule_id
            WHERE r.id = $1
            GROUP BY r.id;
            `;

            const result = await client.query(ruleWithRolesQuery, [rule.id]);

            await client.query('COMMIT');
            
            return new Rules(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    },

    updateSilenceMode: async (id, silenceMode) => {
        const updateSilenceModeQuert = 
        `
        UPDATE rules
        SET silence_mode = $1
        WHERE id = $2
        RETURNING *;
        `

        const result = await pool.query(updateSilenceModeQuert, [silenceMode, id]);

        return new Rules(result.rows[0]);
    },

    updateActiveStatus: async (id, isActive) => {
        const updateActiveStatusQuery = 
        `
        UPDATE rules
        SET is_active = $1
        WHERE id = $2
        RETURNING *;
        `;

        const result = await pool.query(updateActiveStatusQuery, [isActive, id]);

        return new Rules(result.rows[0]);
    },

    delete: async (id) => {
        const deleteQuery = ` DELETE FROM rules WHERE id = $1; `;

        await pool.query(deleteQuery, [id]);
    }
};