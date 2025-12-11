import { validateSQLQueryAST, validateSQLQueryRegex } from '../utils/sql-validation.js'
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
        if(!validateSQLQueryRegex(this.sql)){
            throw new BusinessLogicError('SQL contains forbidden commands');
        }
        if(validateSQLQueryAST(this.sql).valid === false){
            throw new BusinessLogicError(`${validateSQLQueryAST(this.sql).error}`);
        }

        return this;
    }

    static fromArray(sqlTests){
        return sqlTests.map(sqlTest => new SQLTest(sqlTest));
    }
};