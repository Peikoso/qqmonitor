import { NotFoundError } from "../utils/errors.js";
import { AuthService } from "./auth.js";
import { MetricsRepository } from "../repositories/metrics.js";
import { config } from "../config/index.js";
import { UserService } from "./users.js";
import { redact } from "../utils/redact.js";

export const MetricService = {
    getBasicMetrics: async () => {
        const metrics = await MetricsRepository.getBasicMetrics();

        if (!metrics) {
            throw new NotFoundError('No metrics found');
        }

        return metrics;
    },

    getMetrics: async (startDate, endDate, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(user);

        try{
            const response = await fetch(
                `${config.METRICS_API_URL}/metrics/${startDate}/${endDate}`, 
                { 
                    method: 'GET',
                    headers: { 'Authorization': `Token ${config.TOKEN_API}` },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch metrics: ${response.status} ${redact(response.statusText)}`);
            }

            const data = await response.json();
            
            return data;

        } catch (error) {
            console.error('Error fetching metrics:', redact(error));
        }
    }
};