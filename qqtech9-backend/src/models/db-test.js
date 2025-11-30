export class DBTest {
    constructor({ currentTime, pgVersion, tableCounts }) {
        this.currentTime = currentTime;
        this.pgVersion = pgVersion;
        this.tableCounts = tableCounts;
    }
};