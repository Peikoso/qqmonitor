export class ResponseSQLTestDto {
    constructor(sqlTest){
        this.id = sqlTest.id;
        this.userId = sqlTest.userId;
        this.sql = sqlTest.sql;
        this.result = sqlTest.result;
        this.createdAt = sqlTest.createdAt;
    }

    static fromArray(sqlTests){
        return sqlTests.map(sqlTest => new ResponseSQLTestDto(sqlTest));
    }
};