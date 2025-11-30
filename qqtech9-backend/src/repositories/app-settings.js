import { pool } from '../config/database-conn.js';
import { AppSettings } from '../models/app-settings.js';

export const AppSettingsRepository = {
    findAll: async () => {
        const result = await pool.query('SELECT * FROM app_settings');

        return AppSettings.fromArray(result.rows);
    },

    findByKey: async (key) => {
        const selectByKeyQuery = 
        `SELECT * FROM app_settings 
        WHERE key = $1
        `;
            
        const result = await pool.query(selectByKeyQuery, [key]);

        if(!result.rows[0]){
            return null;
        }

        return new AppSettings(result.rows[0]);
    },

    create: async (appSettings) => {
        const insertQuery =
        `
        INSERT INTO app_settings (key, value, updated_by_user_id)
        VALUES ($1, $2, $3)
        RETURNING *;
        `

        const values = [
            appSettings.key,
            appSettings.value,
            appSettings.updatedByUserId
        ];

        const result = await pool.query(insertQuery, values);

        return new AppSettings(result.rows[0]);
    },

    update: async (appSettings) => {
        const updateQuery =
        `
        UPDATE app_settings
        SET value = $1,
            updated_by_user_id = $2,
            updated_at = $3
        WHERE key = $4  
        RETURNING *;
        `

        const values = [
            appSettings.value,
            appSettings.updatedByUserId,
            appSettings.updatedAt,
            appSettings.key
        ];

        const result = await pool.query(updateQuery, values);

        return new AppSettings(result.rows[0]);
    },

    delete: async(key) => {
        const deleteQuery =
        `
        DELETE FROM app_settings
        WHERE key = $1;
        `;

        await pool.query(deleteQuery, [key]);
    }


}