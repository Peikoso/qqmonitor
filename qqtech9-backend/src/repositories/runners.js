import { pool } from '../config/database-conn.js';
import { Runners, RunnerQueue, RunnerLogs } from '../models/runners.js';

export const RunnersRepository = {
    findAllPaginatedWithFilters: async (
        ruleName, status, priority, databaseType, isSuperAdmin, roles, limit, offset
    ) => {
        const selectQuery = 
        `
        SELECT 
            r.*,
            json_build_object(
                'id', rl.id,
                'name', rl.name,
                'database_type', rl.database_type,
                'priority', rl.priority,
                'execution_interval_ms', rl.execution_interval_ms,
                'is_active', rl.is_active
            ) AS rule
        FROM runners r
        LEFT JOIN rules rl 
            ON r.rule_id = rl.id
        WHERE
            ($1::varchar IS NULL OR rl.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR r.status = $2)
            AND ($3::varchar IS NULL OR rl.priority = $3)
            AND ($4::varchar IS NULL OR rl.database_type = $4)
            AND (
                $5::boolean = true
                OR (
                    $6::uuid[] IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM rules_roles rr_auth
                        WHERE rr_auth.rule_id = rl.id
                        AND rr_auth.role_id = ANY($6::uuid[])
                    )
                )
            )
        GROUP BY r.id, rl.id
        ORDER BY last_run_at DESC
        LIMIT $7 OFFSET $8;
        `;


        const values = [
            ruleName || null,
            status || null,
            priority || null,
            databaseType || null,
            isSuperAdmin,
            roles?.length ? roles : null,
            limit,
            offset,
        ];

        const result = await pool.query(selectQuery, values);

        return Runners.fromArray(result.rows);
    },

    findById: async (id) => {
        const selectIdQuery = 
        `
        SELECT * FROM runners
        WHERE id = $1
        `;

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Runners(result.rows[0]);
    },

    create: async (runner, client = pool) => {
        const insertRunnerQuery = 
        `
        INSERT INTO runners
        (rule_id, status, last_run_at)
        VALUES ($1, $2, $3)
        RETURNING *; 
        `;

        const values = [
            runner.ruleId,
            runner.status,
            runner.lastRunAt,
        ];

        const result =  await client.query(insertRunnerQuery, values);
        
        return new Runners(result.rows[0]);
    },

    update: async (runner) => {
        const updateQuery = 
        `
        UPDATE runners
        SET rule_id = $1,
            status = $2,
            last_run_at = $3
        WHERE id = $4
        RETURNING *;
        `;

        const values = [
            runner.ruleId,
            runner.status,
            runner.lastRunAt,
            runner.id
        ];

        const result = await pool.query(updateQuery, values);

        return new Runners(result.rows[0]);
    },

    delete: async (id) => {
        const deleteQuery = 
        `
        DELETE FROM runners
        WHERE id = $1;
        `;

        await pool.query(deleteQuery, [id]);
    }
};

export const RunnerQueueRepository = {
    findAll: async (
        ruleName, status, rulePriority, isSuperAdmin, roles, limit, offset
    ) => {
        const selectQuery =
        `
        SELECT 
            rq.*,
            json_build_object(
                'id', rl.id,
                'name', rl.name,
                'priority', rl.priority
            
            ) AS rule
        FROM runner_queue rq
        LEFT JOIN runners r 
            ON rq.runner_id = r.id
        LEFT JOIN rules rl
            ON r.rule_id = rl.id
        WHERE
            ($1::varchar IS NULL OR rl.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR rq.status = $2)
            AND ($3::varchar IS NULL OR rl.priority = $3)
            AND (
                $4::boolean = true
                OR (
                    $5::uuid[] IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM rules_roles rr_auth
                        WHERE rr_auth.rule_id = rl.id
                        AND rr_auth.role_id = ANY($5::uuid[])
                    )
                )
            )
        GROUP BY rq.id, rl.id
        ORDER BY scheduled_for DESC
        LIMIT $6 OFFSET $7;
        `;

        const value = [
            ruleName || null,
            status || null,
            rulePriority || null,
            isSuperAdmin,
            roles?.length ? roles : null,
            limit,
            offset,
        ];

        const result = await pool.query(selectQuery, value);

        return RunnerQueue.fromArray(result.rows);
    },

    findById: async (id) => {
        const selectIdQuery = 
        `
        SELECT * FROM runner_queue
        WHERE id = $1
        `;

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new RunnerQueue(result.rows[0]);
    },

    create: async (runnerQueue) => {
        const insertQuery = 
        `
        INSERT INTO runner_queue
        (runner_id, scheduled_for)
        VALUES ($1, $2)
        RETURNING *;
        `

        const values = [
            runnerQueue.runnerId,
            runnerQueue.scheduledFor,
        ];

        const result = await pool.query(insertQuery, values);

        return new RunnerQueue(result.rows[0]);
    },

    update: async (runnerQueue) => {
        const updateQuery = 
        `
        UPDATE runner_queue
        SET status = $1,
            scheduled_for = $2,
            started_at = $3,
            finished_at = $4,
            attempt_count = $5
        WHERE id = $6
        RETURNING *;
        `;

        const values = [
            runnerQueue.status,
            runnerQueue.scheduledFor,
            runnerQueue.startedAt,
            runnerQueue.finishedAt,
            runnerQueue.attemptCount,
            runnerQueue.id
        ];

        const result = await pool.query(updateQuery, values);

        return new RunnerQueue(result.rows[0]);
    },

    delete: async (id) => {
        const deleteQuery = 
        `
        DELETE FROM runner_queue
        WHERE id = $1;
        `;

        await pool.query(deleteQuery, [id]);
    }
};

export const RunnerLogsRepository = {
    findAll: async (
        ruleName, executionStatus, limit, offset
    ) => {
        const selectQuery =
        `
        SELECT 
            rlogs.*,
            json_build_object(
                'id', rl.id,
                'name', rl.name,
                'database_type', rl.database_type,
                'priority', rl.priority
            ) AS rule
        FROM runner_logs rlogs
        LEFT JOIN runners r
            ON rlogs.runner_id = r.id
        LEFT JOIN rules rl
            ON r.rule_id = rl.id
        WHERE
            ($1::varchar IS NULL OR rl.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR rlogs.execution_status = $2)
        GROUP BY rlogs.id, rl.id
        ORDER BY executed_at DESC
        LIMIT $3 OFFSET $4;
        `;

        const values = [
            ruleName || null,
            executionStatus || null,
            limit,
            offset,
        ];

        const result = await pool.query(selectQuery, values);


        return RunnerLogs.fromArray(result.rows);
    },

    create: async (runnerLog) => {
        const insertQuery = 
        `
        INSERT INTO runner_logs
        (runner_id, queue_id, run_time_ms, execution_status, rows_affected, result, error, executed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
        `

        const values = [
            runnerLog.runnerId,
            runnerLog.queueId,
            runnerLog.runTimeMs,
            runnerLog.executionStatus,
            runnerLog.rowsAffected, 
            runnerLog.result,
            runnerLog.error,
            runnerLog.executedAt
        ];

        const result = await pool.query(insertQuery, values);

        return new RunnerLogs(result.rows[0]);
    }
}
