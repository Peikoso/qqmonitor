from sqlalchemy import  text
from config.database import get_session
from models.runners import Runners, RunnerQueue, RunnerLogs


class RunnersRepository:
    @staticmethod
    async def find_all_for_scheduling():
        query = text(
        """
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
        """
        )
        
        async with get_session() as session:
            result = await session.execute(query)
            rows = result.fetchall()
            return Runners.from_array([dict(row._mapping) for row in rows])

    @staticmethod
    async def find_by_id(runner_id):
        async with get_session() as session:
            query = text( 
            """
            SELECT * FROM runners
            WHERE id = :id
            """
            ).bindparams(id=runner_id)
            
            result = await session.execute(query)
            row = result.fetchone()
            
            if not row:
                return None
            
            return Runners(**dict(row._mapping))

    @staticmethod
    async def update(runner):
        async with get_session() as session:
            query=text(
            """
            UPDATE runners
            SET rule_id = :rule_id,
                status = :status,
                last_run_at = :last_run_at
            WHERE id = :id
            RETURNING *;
            """
            )
            
            query = query.bindparams(
                rule_id = runner.rule_id,
                status = runner.status,
                last_run_at = runner.last_run_at,
                id = runner.id
            )
            
            result = await session.execute(query)
            await session.commit()
            row = result.fetchone()
            return Runners(**dict(row._mapping))


class RunnerQueueRepository:
    @staticmethod
    async def find_pending_jobs(limit):
        query = text(
        """
        SELECT * FROM runner_queue
        WHERE status = 'PENDING'
        AND scheduled_for AT TIME ZONE 'UTC' <= NOW()
        ORDER BY scheduled_for ASC
        LIMIT :limit;
        """
        ).bindparams(limit=limit)
        
        async with get_session() as session:
            result = await session.execute(query)
            rows = result.fetchall()
            return RunnerQueue.from_array([dict(row._mapping) for row in rows])

    @staticmethod
    async def find_pending_by_runner_id(runner_id):
        query = text(
        """
        SELECT * FROM runner_queue
        WHERE runner_id = :runner_id
        AND status in ('PENDING', 'PROCESSING')
        LIMIT 1;
        """
        ).bindparams(runner_id=runner_id)
        
        async with get_session() as session:
            result = await session.execute(query)
            row = result.fetchone()
            
            if not row:
                return None
            
            return RunnerQueue(**dict(row._mapping))

    @staticmethod
    async def create(runner_queue):
        query = text(
        """
        INSERT INTO runner_queue
        (runner_id, scheduled_for)
        VALUES (:runner_id, :scheduled_for)
        RETURNING *;
        """
        )
        
        query = query.bindparams(
            runner_id=runner_queue.runner_id,
            scheduled_for=runner_queue.scheduled_for
        )
        
        
        async with get_session() as session:
            result = await session.execute(query)
            await session.commit()
            row = result.fetchone()
            return RunnerQueue(**dict(row._mapping))

    @staticmethod
    async def update(runner_queue):
        query = text(
        """
        UPDATE runner_queue
        SET status = :status,
            scheduled_for = :scheduled_for,
            queued_at = :queued_at,
            started_at = :started_at,
            finished_at = :finished_at,
            attempt_count = :attempt_count
        WHERE id = :id
        RETURNING *;
        """
        )
        
        query = query.bindparams(
            status=runner_queue.status,
            scheduled_for=runner_queue.scheduled_for,
            queued_at=runner_queue.queued_at,
            started_at=runner_queue.started_at,
            finished_at=runner_queue.finished_at,
            attempt_count=runner_queue.attempt_count,
            id=runner_queue.id
        )
        
        async with get_session() as session:
            result = await session.execute(query)   
            await session.commit()
            row = result.fetchone()
            return RunnerQueue(**dict(row._mapping))


class RunnerLogsRepository:
    @staticmethod
    async def create(runner_log):
        query = text(
        """
        INSERT INTO runner_logs
        (runner_id, queue_id, run_time_ms, execution_status, rows_affected, result, error, executed_at)
        VALUES (:runner_id, :queue_id, :run_time_ms, :execution_status, :rows_affected, :result, :error, :executed_at)
        RETURNING *;
        """
        )
        
        query = query.bindparams(
            runner_id=runner_log.runner_id,
            queue_id=runner_log.queue_id,
            run_time_ms=runner_log.run_time_ms,
            execution_status=runner_log.execution_status,
            rows_affected=runner_log.rows_affected,
            result=runner_log.result,
            error=runner_log.error,
            executed_at=runner_log.executed_at
        )
        
        async with get_session() as session:
            result = await session.execute(query)
            await session.commit()
            row = result.fetchone()
            return RunnerLogs(**dict(row._mapping))
