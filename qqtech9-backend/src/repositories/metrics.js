import { pool } from "../config/database-conn.js";
import { BasicMetrics } from "../models/metrics.js";

export const MetricsRepository = {
    getBasicMetrics: async () => {
        const result = await pool.query(`
            SELECT * FROM plantao_monitor;
        `);

        if(!result.rows[0]) {
            return null;
        }

        return new BasicMetrics(result.rows[0]);
    }
};