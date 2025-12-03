import { pool } from "../config/database-conn.js";
import { Notifications } from "../models/notifications.js";

export const NotificationsRepository = {
    findById: async (id) => {
        const selectByIdQuery =
        `
        SELECT * FROM notifications
        WHERE id = $1
        `;

        const result = await pool.query(selectByIdQuery, [id]);

        if(!result.rows[0]){
            return null
        }

        return new Notifications(result.rows[0]);
    },

    findByUserId: async (id) => {
        const selectQuery = 'SELECT * FROM notifications WHERE user_id = $1';
        
        const result = await pool.query(selectQuery, [id]);

        return Notifications.fromArray(result.rows);
    },

    create: async (notification) => {
        const insertQuery = 
        `
        INSERT INTO notifications
        (user_id, channel_id, incident_id, title, message, status, sent_at, error)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
        `;
        const values = [
            notification.userId,
            notification.channelId,
            notification.incidentId,
            notification.title,
            notification.message,
            notification.status,
            notification.sentAt,
            notification.error
        ];

        const result = await pool.query(insertQuery, values);

        return new Notifications(result.rows[0]);
    },

    update: async (notification) => {
        const updateQuery = 
        `
        UPDATE notifications
        SET 
            status = $1,
            read_at = $2,
            error = $3
        WHERE id = $4
        RETURNING *;
        `;

        const values = [
            notification.status,
            notification.readAt,
            notification.error,
            notification.id,
        ];

        const result = await pool.query(updateQuery, values);

        return new Notifications(result.rows[0]);
    },

    delete: async (id) => {
        const deleteQuery = 
        `
        DELETE FROM notifications 
        WHERE id = $1
        `;

        await pool.query(deleteQuery, [id]);
    }
};