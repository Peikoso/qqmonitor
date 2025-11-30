import { DBTestService } from '../services/db-test.js';
import { ResponseDBTestDTO } from '../dto/db_test/response-db-test-dto.js';

export const DBTestController = {
    testDatabaseConnection: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        const dbTestResult = await DBTestService.testDatabaseConnection(currentUserFirebaseUid);
        
        const response = new ResponseDBTestDTO(dbTestResult);

        res.status(200).json(response);
        
    }
};