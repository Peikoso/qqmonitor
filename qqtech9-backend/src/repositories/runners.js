import { pool } from '../config/database-conn.js';
import { Runners, RunnerQueue, RunnerLogs } from '../models/runners.js';

export const RunnersRepository = {
    findAllPaginatedWithFilters: async (
        ruleName, status, priority, databaseType, limit, offset
    ) => {
        const selectQuery = 
        `
        SELECT 
            r.*,
            json_agg(
                json_build_object(
                    'id', rl.id,
                    'name', rl.name,
                    'database_type', rl.database_type,
                    'priority', rl.priority
                )
            ) AS rule
        FROM runners r
        LEFT JOIN rules rl 
            ON r.rule_id = rl.id
        WHERE
            ($1::varchar IS NULL OR rl.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR r.status = $2)
            AND ($3::varchar IS NULL OR rl.priority = $3)
            AND ($4::varchar IS NULL OR rl.database_type = $4)
        GROUP BY r.id
        ORDER BY updated_at DESC
        LIMIT $5 OFFSET $6;
        `;


        const values = [
            ruleName || null,
            status || null,
            priority || null,
            databaseType || null,
            limit,
            offset,
        ];

        const result = await pool.query(selectQuery, values);

        return Runners.fromArray(result.rows);
    },

    findAllForScheduling: async () => {
        const result = await pool.query(
            `
            SELECT r.*
            FROM runners r
            LEFT JOIN rules rl
                ON r.rule_id = rl.id
            ORDER BY 
                CASE rl.priority
                    WHEN 'HIGH' THEN 1
                    WHEN 'MEDIUM' THEN 2
                    WHEN 'LOW' THEN 3
                    ELSE 4
                END;
            `
        );

        return Runners.fromArray(result.rows)
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
        ruleName, status, rulePriority, limit, offset
    ) => {
        const selectQuery =
        `
        SELECT 
            rq.*,
            json_agg(
                json_build_object(
                    'id', rl.id,
                    'name', rl.name,
                    'priority', rl.priority
                )
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
        GROUP BY rq.id
        ORDER BY queued_at DESC
        LIMIT $4 OFFSET $5;
        `;

        const value = [
            ruleName || null,
            status || null,
            rulePriority || null,
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

    findPendingJobs: async (limit) => {
        const selectQuery = 
        `
        SELECT * FROM runner_queue
        WHERE status = 'PENDING'
        AND scheduled_for <= NOW()
        ORDER BY scheduled_for ASC
        LIMIT $1;
        `;

        const result = await pool.query(selectQuery, [limit]);

        return RunnerQueue.fromArray(result.rows);
    },

    findPendingByRunnerId: async (runnerId) => {
        const selectQuery = 
        `
        SELECT * FROM runner_queue
        WHERE runner_id = $1
        AND status in ('PENDING', 'PROCESSING')
        LIMIT 1;
        `;

        const result = await pool.query(selectQuery, [runnerId]);

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
            queued_at = $3,
            started_at = $4,
            finished_at = $5,
            attempt_count = $6
        WHERE id = $7
        RETURNING *;
        `;

        const values = [
            runnerQueue.status,
            runnerQueue.scheduledFor,
            runnerQueue.queuedAt,
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
        ruleName, executionStatus, rulePriority, databaseType, limit, offset
    ) => {
        const selectQuery =
        `
        SELECT 
            rlogs.*,
            json_agg(
                json_build_object(
                    'id', rl.id,
                    'name', rl.name,
                    'database_type', rl.database_type,
                    'priority', rl.priority
                )
            ) AS rule
        FROM runner_logs rlogs
        LEFT JOIN runners r
            ON rlogs.runner_id = r.id
        LEFT JOIN rules rl
            ON r.rule_id = rl.id
        WHERE
            ($1::varchar IS NULL OR rl.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR rlogs.execution_status = $2)
            AND ($3::varchar IS NULL OR rl.priority = $3)
            AND ($4::varchar IS NULL OR rl.database_type = $4)
        GROUP BY rlogs.id
        ORDER BY executed_at DESC
        LIMIT $5 OFFSET $6;
        `;

        const values = [
            ruleName || null,
            executionStatus || null,
            rulePriority || null,
            databaseType || null,
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
