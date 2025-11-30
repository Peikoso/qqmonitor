import { BusinessLogicError } from "../utils/errors.js";

export class Runners {
    constructor(runner){
        this.id = runner.id;
        this.ruleId = runner.rule_id ?? runner.ruleId;
        this.status = runner.status;
        this.lastRunAt = runner.last_run_at ?? runner.lastRunAt;
        this.createdAt = runner.created_at ?? runner.createdAt;
        this.updatedAt = runner.updated_at ?? runner.updatedAt;

        this.rule = runner.rule;
    }

    static fromArray(runnersArray) {   
        return runnersArray.map(runner => new Runners(runner));
    }
    
};

export class RunnerQueue{
    constructor(runnerQueue){
        this.id = runnerQueue.id;
        this.runnerId = runnerQueue.runner_id ?? runnerQueue.runnerId;
        this.status = runnerQueue.status;
        this.scheduledFor = runnerQueue.scheduled_for ?? runnerQueue.scheduledFor;
        this.queuedAt = runnerQueue.queued_at ?? runnerQueue.queuedAt;
        this.startedAt = runnerQueue.started_at ?? runnerQueue.startedAt;
        this.finishedAt = runnerQueue.finished_at ?? runnerQueue.finishedAt;
        this.attemptCount = runnerQueue.attempt_count ?? runnerQueue.attemptCount;

        this.rule = runnerQueue.rule;
    }

    static fromArray(runnerQueueArray) {
        return runnerQueueArray.map(runnerQueue => new RunnerQueue(runnerQueue));
    }
};

export class RunnerLogs {
    constructor(runnerLog){
        this.id = runnerLog.id;
        this.runnerId = runnerLog.runner_id ?? runnerLog.runnerId;
        this.queueId = runnerLog.queue_id ?? runnerLog.queueId;
        this.runTimeMs = runnerLog.run_time_ms ?? runnerLog.runTimeMs;
        this.executionStatus = runnerLog.execution_status ?? runnerLog.executionStatus;
        this.rowsAffected = runnerLog.rows_affected ?? runnerLog.rowsAffected;
        this.result = runnerLog.result;
        this.error = runnerLog.error;
        this.executedAt = runnerLog.executed_at ?? runnerLog.executedAt;

        this.rule = runnerLog.rule;
    }

    static fromArray(runnerLogsArray) {
        return runnerLogsArray.map(runnerLog => new RunnerLogs(runnerLog));
    }
};