import { pool } from "../config/database-conn.js";
import { Channels } from "../models/channels.js";

export const ChannelsRepository = {
    findAll: async () => {
        const response = await pool.query(
            `
            SELECT * FROM channels
            ORDER BY created_at DESC
            `
        );

        return Channels.fromArray(response.rows);
    },

    findById: async (id) => {
        const selectIdQuery =
        ` 
        SELECT * FROM channels
        WHERE id = $1
        `;

        const result = await pool.query(selectIdQuery, [id]);

        if (!result.rows[0]) {
            return null;
        }

        return new Channels(result.rows[0]);
    },

    create: async (channel) => {
        const insertQuery = 
        `
        INSERT INTO channels (type, name, config, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;  

        const values = [
            channel.type,
            channel.name,
            channel.config,
            channel.isActive,
        ];

        const response = await pool.query(insertQuery, values);

        return new Channels(response.rows[0]);
    },

    update: async (channel) => {
        const updateQuery = 
        `
        UPDATE channels
        SET type = $1,
            name = $2,
            config = $3,
            is_active = $4,
            updated_at = $5
        WHERE id = $6
        RETURNING *
        `;

        const values = [
            channel.type,
            channel.name,
            channel.config,
            channel.isActive,
            channel.updatedAt,
            channel.id,
        ];

        const response = await pool.query(updateQuery, values);

        return new Channels(response.rows[0]);
    },

    delete: async (id) => {
        const deleteQuery = 
        `
        DELETE FROM channels
        WHERE id = $1
        `;
        
        await pool.query(deleteQuery, [id]);
    }
};