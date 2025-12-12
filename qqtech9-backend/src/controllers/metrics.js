import { MetricService } from '../services/metrics.js';
import { ResponseMetricsDto } from '../dto/metrics/response-metrics-dto.js';

export const MetricsController = {
    getBasicMetrics: async (req, res) => {
        const metrics = await MetricService.getBasicMetrics();

        const response = new ResponseMetricsDto(metrics);
        
        return res.status(200).json(response);
    },

    getMetrics: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { startDate, endDate } = req.params;

        const metrics = await MetricService.getMetrics(startDate, endDate, currentUserFirebaseUid);

        console.log(metrics);

        return res.status(200).json(metrics);
    }
};