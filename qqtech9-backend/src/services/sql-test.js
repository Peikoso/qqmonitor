import { SQLTest } from '../models/sql-test.js';
import { SQLTestsRepository } from '../repositories/sql-test.js';
import { UserService } from './users.js';
import { ForbiddenError } from '../utils/errors.js';

export const SQLTestService = {
    getAllSQLTests: async () => {
        const sqlTests = await SQLTestsRepository.findAll();

        return sqlTests;
    },

    createSQLTest: async (dto) => {
        const newSQLTest = new SQLTest(dto).validateBusinessLogic();

        await UserService.getUserById(newSQLTest.userId);

        const savedSQLTest = await SQLTestsRepository.create(newSQLTest);

        return savedSQLTest;
    }
};