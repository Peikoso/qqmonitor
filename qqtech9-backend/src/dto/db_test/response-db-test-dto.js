export class ResponseDBTestDTO {
    constructor(dbTest) {
        this.currentTime = dbTest.currentTime;
        this.pgVersion = dbTest.pgVersion;
        this.tableCounts = dbTest.tableCounts;
    }
};