import { RunnerService, RunnerLogService, RunnerQueueService } from '../services/runners.js';
import { ResponseRunnersDto, ResponseRunnerLogsDto, ResponseRunnerQueueDto } from '../dto/runners/response-runners-dto.js';

export const RunnersController = {
    getAllRunners: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { ruleName, status, priority, databaseType, page, perPage } = req.query;

        const runners = await RunnerService.getAllRunners(
            currentUserFirebaseUid, ruleName, status, priority, databaseType, page, perPage
        );

        const response = ResponseRunnersDto.fromArray(runners);

        return res.status(200).json(response);
    },

};

export const RunnerQueueController = {
    getAllRunnerQueue: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { ruleName, status, rulePriority, page, perPage } = req.query;

        const runnerQueue = await RunnerQueueService.getAllRunnerQueue(
            currentUserFirebaseUid, ruleName, status, rulePriority, page, perPage
        );

        const response = ResponseRunnerQueueDto.fromArray(runnerQueue);

        return res.status(200).json(response);
    },

};

export const RunnerLogsController = {
    getAllRunnersLogs: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { ruleName, executionStatus, page, perPage } = req.query;
        
        const runnersLogs = await RunnerLogService.getAllRunnersLogs(
            currentUserFirebaseUid, ruleName, executionStatus, page, perPage
        );
        
        const response = ResponseRunnerLogsDto.fromArray(runnersLogs);

        return res.status(200).json(response);
    },

};