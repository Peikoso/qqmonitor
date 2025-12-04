import { ValidationError } from '../../utils/errors.js';

export class CreateSQLTestDto {
    constructor(sqlTest){
        this.sql = sqlTest.sql?.trim();
    }

    validate(){
        if(this.sql === '' || !this.sql){
            throw new ValidationError('SQL is required');
        }

        return this;
    }
};