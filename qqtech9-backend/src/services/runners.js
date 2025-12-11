import { Runners, RunnerLogs, RunnerQueue } from "../models/runners.js";
import { RunnersRepository, RunnerLogsRepository, RunnerQueueRepository } from "../repositories/runners.js";
import { AuthService } from "./auth.js";
import { UserService } from "./users.js";


export const RunnerService = {
    getAllRunners: async (
        currentUserFirebaseUid, ruleName, status, priority, databaseType, page, perPage
    ) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const isSuperAdmin = AuthService.isSuperadmin(user);
        await AuthService.requireOperator(user);
        

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const runners = await RunnersRepository.findAllPaginatedWithFilters(
            ruleName, 
            status, 
            priority, 
            databaseType,
            isSuperAdmin, 
            user.roles.map(role => role.id),
            limit, 
            offset
        );

        return runners;
    },

    createRunnerForRule: async (ruleId, client) => {
        const newRunner = new Runners({
            ruleId: ruleId,
            status: 'IDLE',
            lastRunAt: null,
        });

        const savedRunner = await RunnersRepository.create(newRunner, client);

        return savedRunner;
    },


};

export const RunnerQueueService = {
    getAllRunnerQueue: async (
        currentUserFirebaseUid, ruleName, status, rulePriority, page, perPage
    ) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const isSuperAdmin = AuthService.isSuperadmin(user);
        await AuthService.requireOperator(user);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const runnerQueue = await RunnerQueueRepository.findAll(
            ruleName, 
            status, 
            rulePriority,
            isSuperAdmin, 
            user.roles.map(role => role.id), 
            limit, 
            offset
        );

        return runnerQueue;
    },

};

export const RunnerLogService = {
    getAllRunnersLogs: async (
        currentUserFirebaseUid, ruleName, executionStatus, page, perPage
    ) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(user);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const runnersLogs = await RunnerLogsRepository.findAll(
            ruleName,
            executionStatus, 
            limit, 
            offset
        );

        return runnersLogs;
    },

};