import { ValidationError } from '../../utils/errors.js';

export class CreateSQLTestDto {
    constructor(sqlTest){
        this.userId = sqlTest.userId?.trim();
        this.sql = sqlTest.sql?.trim();
        this.result = sqlTest.result?.trim();
    }

    validate(){
        if(this.userId === '' || !this.userId){
            throw new ValidationError('userId is required');
        }
        if(this.sql === '' || !this.sql){
            throw new ValidationError('SQL is required');
        }
        if(this.result === '' || !this.result){
            throw new ValidationError('Result is required');
        }

        return this;
    }
};