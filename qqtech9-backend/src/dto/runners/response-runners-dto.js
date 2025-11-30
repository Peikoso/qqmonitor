export class ResponseRunnersDto {
    constructor(runner){
        this.id = runner.id;
        this.ruleId = runner.ruleId;
        this.status = runner.status;
        this.lastRunAt = runner.lastRunAt;

        this.rule = runner.rule;
    }

    static fromArray(runnersArray) {   
        return runnersArray.map(runner => new ResponseRunnersDto(runner));
    }
};

export class ResponseRunnerQueueDto {
    constructor(runnerQueue){
        this.id = runnerQueue.id;
        this.runnerId = runnerQueue.runnerId;
        this.scheduledFor = runnerQueue.scheduledFor;
        this.queuedAt = runnerQueue.queuedAt;
        this.startedAt = runnerQueue.startedAt;
        this.finishedAt = runnerQueue.finishedAt;
        this.status = runnerQueue.status;
        this.attemptCount = runnerQueue.attemptCount;

        this.rule = runnerQueue.rule;
    }

    static fromArray(runnerQueueArray) {
        return runnerQueueArray.map(runnerQueue => new ResponseRunnerQueueDto(runnerQueue));
    }
};

export class ResponseRunnerLogsDto {
    constructor(runnerLog){
        this.id = runnerLog.id;
        this.runnerId = runnerLog.runnerId;
        this.queueId = runnerLog.queueId;
        this.runTimeMs = runnerLog.runTimeMs;
        this.executionStatus = runnerLog.executionStatus;
        this.rowsAffected = runnerLog.rowsAffected;
        this.result = runnerLog.result;
        this.error = runnerLog.error;
        this.executedAt = runnerLog.executedAt;

        this.rule = runnerLog.rule;
    }

    static fromArray(runnerLogsArray) {
        return runnerLogsArray.map(runnerLog => new ResponseRunnerLogsDto(runnerLog));
    }
};