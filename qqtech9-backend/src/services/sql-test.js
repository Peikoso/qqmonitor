import { SQLTest } from '../models/sql-test.js';
import { SQLTestsRepository } from '../repositories/sql-test.js';
import { AuthService } from './auth.js';
import { UserService } from './users.js';

export const SQLTestService = {
    getAllSQLTests: async () => {
        const sqlTests = await SQLTestsRepository.findAll();

        return sqlTests;
    },

    createSQLTest: async (dto, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);

        await AuthService.requireOperator(user);

        const newSQLTest = new SQLTest(dto).validateBusinessLogic();

        newSQLTest.userId = user.id;

        const sqlQueryResult = await SQLTestsRepository.executeTest(newSQLTest.sql);

        newSQLTest.result = `${sqlQueryResult.success ? 'SUCCESS' : 'ERROR'}: ${sqlQueryResult.result}`;

        const savedSQLTest = await SQLTestsRepository.create(newSQLTest);

        return savedSQLTest;
    }
};