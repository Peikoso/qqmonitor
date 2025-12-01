import { MetricService } from '../services/metrics.js';
import { ResponseMetricsDto } from '../dto/metrics/response-metrics-dto.js';

export const MetricsController = {
    getBasicMetrics: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        const metrics = await MetricService.getBasicMetrics(currentUserFirebaseUid);

        const response = new ResponseMetricsDto(metrics);
        
        return res.status(200).json(response);
    },
};