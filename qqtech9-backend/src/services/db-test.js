import { DBTestRepository } from '../repositories/db-test.js';
import { AuthService } from './auth.js';
import { DatabaseError } from '../utils/errors.js';

export const DBTestService = {
    testDatabaseConnection: async (currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);
        
        try{
            const dbTestResult = await DBTestRepository.testConnection();
            
            return dbTestResult;

        } catch(error){
            console.error('Database connection test failed:', error);
            throw new DatabaseError('Failed to connect to the database or retrieve information.');
        }

    }
};