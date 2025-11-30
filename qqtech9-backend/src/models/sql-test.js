import { sqlValidantion } from '../utils/validations.js'
import { BusinessLogicError } from '../utils/errors.js';

export class SQLTest {
    constructor(sqlTest){
        this.id = sqlTest.id;
        this.userId = sqlTest.user_id ?? sqlTest.userId;
        this.sql = sqlTest.sql;
        this.result = sqlTest.result;
        this.createdAt = sqlTest.created_at ?? sqlTest.createdAt;
    }

    validateBusinessLogic(){
        if(!sqlValidantion(this.sql)){
            throw new BusinessLogicError('SQL contains forbidden commands');
        }

        return this;
    }

    static fromArray(sqlTests){
        return sqlTests.map(sqlTest => new SQLTest(sqlTest));
    }
};