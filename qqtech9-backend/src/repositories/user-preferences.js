import { pool } from '../config/database-conn.js'
import { UserPreferences } from "../models/user-preferences.js"


export const UserPreferencesRepository = {
    findByUserId: async (userId) => {
        const selectIdQuery = 
        `
        SELECT up.*, array_remove(array_agg(uc.channel_id), NULL) AS channels
        FROM user_preferences up
        LEFT JOIN user_preferences_channels uc 
            ON up.id = uc.user_preferences_id
        WHERE up.user_id = $1
        GROUP BY up.id
        `;

        const result = await pool.query(selectIdQuery, [userId]);

        if(!result.rows[0]){
            return null;
        }

        return new UserPreferences(result.rows[0]);
    },

    findByFirebaseUid: async (firebaseUid) => {
        const selectIdQuery = 
        `
        SELECT 
            up.*, 
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', c.id,
                        'type', c.type,
                        'name', c.name
                    )
                ) FILTER (WHERE c.id IS NOT NULL AND c.is_active = TRUE),
                '[]'::jsonb
            ) AS channels
        FROM user_preferences up
        LEFT JOIN user_preferences_channels uc 
            ON up.id = uc.user_preferences_id
        LEFT JOIN channels c
            ON uc.channel_id = c.id
        LEFT JOIN users u
            ON up.user_id = u.id
        WHERE u.firebase_id = $1
        GROUP BY up.id
        `;
        
        const result = await pool.query(selectIdQuery, [firebaseUid]);

        if(!result.rows[0]){
            return null;
        }

        return new UserPreferences(result.rows[0]);
    },

    create: async (userPreferences) => {
        const client = await pool.connect();

        try{
            await client.query('BEGIN');

            const insertIdQuery = 
            `INSERT INTO user_preferences 
            (user_id, dnd_start_time, dnd_end_time) 
            VALUES ($1, $2, $3) 
            RETURNING *
            `;

            const values = [
                userPreferences.userId,
                userPreferences.dndStartTime,
                userPreferences.dndEndTime,
            ]

            const userPreferencesDb = await client.query(insertIdQuery, values);

            const insertUserPreferencesChannelsQuery =
            `
            INSERT INTO user_preferences_channels (user_preferences_id, channel_id) 
            VALUES ($1, $2)
            `;

            for (const channelId of userPreferences.channels) {
                await client.query(insertUserPreferencesChannelsQuery, [userPreferencesDb.rows[0].id, channelId]);
            }

            const selectUserPreferencesWithChannelsQuery =
            `
            SELECT up.*, array_remove(array_agg(uc.channel_id), NULL) AS channels
            FROM user_preferences up
            LEFT JOIN user_preferences_channels uc 
            ON up.id = uc.user_preferences_id
            WHERE up.id = $1
            GROUP BY up.id
            `
            const userPreferencesWithChannels = await client.query(selectUserPreferencesWithChannelsQuery, [userPreferencesDb.rows[0].id]);

            await client.query('COMMIT');

            return new UserPreferences(userPreferencesWithChannels.rows[0]);

        } catch(error){
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    update: async (userPreferences) => {
        const client = await pool.connect();

        try{
            await client.query('BEGIN');
            const updateUserPreferencesQuery =
            `
            UPDATE user_preferences
            SET dnd_start_time = $1,
                dnd_end_time = $2
            WHERE id = $3
            RETURNING *
            `;

            const values = [
                userPreferences.dndStartTime,
                userPreferences.dndEndTime,
                userPreferences.id,
            ];

            const updatedUserPreferencesDb = await client.query(updateUserPreferencesQuery, values);

            const deleteUserPreferencesChannelsQuery =
            `
            DELETE FROM user_preferences_channels
            WHERE user_preferences_id = $1
            `;

            await client.query(deleteUserPreferencesChannelsQuery, [updatedUserPreferencesDb.rows[0].id]);

            const insertUserPreferencesChannelsQuery =
            `
            INSERT INTO user_preferences_channels (user_preferences_id, channel_id) 
            VALUES ($1, $2)
            `;

            for (const channelId of userPreferences.channels) {
                await client.query(insertUserPreferencesChannelsQuery, [updatedUserPreferencesDb.rows[0].id, channelId]);
            }

            const selectUserPreferencesWithChannelsQuery =
            `
            SELECT up.*, array_remove(array_agg(uc.channel_id), NULL) AS channels
            FROM user_preferences up
            LEFT JOIN user_preferences_channels uc 
            ON up.id = uc.user_preferences_id
            WHERE up.id = $1
            GROUP BY up.id
            `
            const userPreferencesWithChannels = await client.query(selectUserPreferencesWithChannelsQuery, [updatedUserPreferencesDb.rows[0].id]);

            return new UserPreferences(userPreferencesWithChannels.rows[0]);
        } catch(error){
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    delete: async (id) => {
        const deleteQuery =
        `
        DELETE FROM user_preferences
        WHERE id = $1
        `;

        await pool.query(deleteQuery, [id]);
    }
};