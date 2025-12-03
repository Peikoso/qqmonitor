import { NotFoundError } from "../utils/errors.js";
import { AuthService } from "./auth.js";
import { MetricsRepository } from "../repositories/metrics.js";

export const MetricService = {
    getBasicMetrics: async () => {
        const metrics = await MetricsRepository.getBasicMetrics();

        if (!metrics) {
            throw new NotFoundError('No metrics found');
        }

        return metrics;
    },
};