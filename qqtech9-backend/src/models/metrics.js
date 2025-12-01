export class BasicMetrics {
    constructor(metrics) {
        this.totalOpen = metrics.totalOpen ?? metrics.total_open;
        this.totalAck = metrics.totalAck ?? metrics.total_ack;
        this.totalClosed = metrics.totalClosed ?? metrics.total_closed;
        this.totalRulesActive = metrics.totalRulesActive ?? metrics.total_rules_active;
        this.avgAckTimeSeconds = metrics.avgAckTimeSeconds ?? metrics.avg_ack_time_seconds;
        this.avgResolutionTimeSeconds = metrics.avgResolutionTimeSeconds ?? metrics.avg_resolution_time_seconds;
    }

    static fromArray(metricsArray) {
        return metricsArray.map(metrics => new BasicMetrics(metrics));
    }
}