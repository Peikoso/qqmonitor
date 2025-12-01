export class ResponseMetricsDto {
    constructor(metrics) {
        this.totalOpen = metrics.totalOpen;
        this.totalAck = metrics.totalAck;
        this.totalClosed = metrics.totalClosed;
        this.totalRulesActive = metrics.totalRulesActive;
        this.avgAckTimeSeconds = metrics.avgAckTimeSeconds;
        this.avgResolutionTimeSeconds = metrics.avgResolutionTimeSeconds;
    }

    fromArray(metricsArray) {
        return metricsArray.map(metrics => new ResponseMetricsDto(metrics));
    }
}