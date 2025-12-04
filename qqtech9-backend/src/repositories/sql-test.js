import { pool } from '../config/database-conn.js'
import { SQLTest } from '../models/sql-test.js';

export const SQLTestsRepository = {
    findAll: async () => {
        const result = await pool.query('SELECT * FROM sql_test_logs');

        return SQLTest.fromArray(result.rows);
    },

    create: async (sqlTest) => {
        const insertQuery = 
        `
        INSERT INTO sql_test_logs (user_id, sql, result) 
        VALUES ($1, $2, $3) 
        RETURNING *
        `;

        const values = [
            sqlTest.userId, 
            sqlTest.sql, 
            sqlTest.result
        ];

        const result = await pool.query(insertQuery, values);

        return new SQLTest(result.rows[0]);
    },
    
    executeTest: async (sql) => {
        try {
            const result = await pool.query(sql);
            return { success: true, result: `Query executada com sucesso. Linhas afetadas: ${result.rowCount}` };
        } catch (error) {
            return { success: false, result: error.message };
        }
    }
};