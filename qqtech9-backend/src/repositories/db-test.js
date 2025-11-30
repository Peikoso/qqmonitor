import { pool } from "../config/database-conn.js";
import { DBTest } from "../models/db-test.js";

export const DBTestRepository = {
    testConnection: async () => {
        const result = await pool.query('SELECT NOW() AS current_time, version() as pg_version;');
        
        const tables = await pool.query(
            `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public';
            `
        );

        const tablesNames = tables.rows.map(row => row.table_name);

        const counts = {};
        for(const tableName of tablesNames){
            const countResult = await pool.query(`SELECT COUNT(*) AS count FROM ${tableName};`);
            counts[tableName] = parseInt(countResult.rows[0].count);
        }

        return new DBTest({
            currentTime: result.rows[0].current_time,
            pgVersion: result.rows[0].pg_version,
            tableCounts: counts
        });
    },
};