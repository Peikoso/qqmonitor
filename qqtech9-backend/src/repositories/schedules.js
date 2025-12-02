import { pool } from '../config/database-conn.js';
import { Schedules } from '../models/schedules.js';

export const SchedulesRepository = {
    findUpcomingSchedules: async (date) => {
        const selectQuery = 
        `
        SELECT * FROM schedules
        WHERE DATE(start_time) >= $1 
        ORDER BY start_time DESC
        `;

        const result = await pool.query(selectQuery, [date]);
        
        return Schedules.fromArray(result.rows);
    },

    findCurrentScheduleByRoleId: async (rolesId, date) => {
        const selectQuery = 
        `
        SELECT s.* FROM schedules s
        JOIN users u 
            ON s.user_id = u.id
        WHERE 
            $1::uuid[] IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM user_roles ur
                WHERE ur.user_id = u.id
                AND ur.role_id = ANY($1::uuid[])
            )
            AND $2 BETWEEN DATE(s.start_time) AND DATE(s.end_time)
        ORDER BY s.start_time ASC
        LIMIT 1;
        `;

        const result = await pool.query(selectQuery, [rolesId, date]);

        if(!result.rows[0]){
            return null;
        }

        return new Schedules(result.rows[0]);
    },

    findById: async (id) => {
        const selectIdQuery = 
        `
        SELECT * FROM schedules
        WHERE id = $1
        `;

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Schedules(result.rows[0]);
    },

    create: async (schedule) => {
        const insertQuery = 
        `
        INSERT INTO schedules
        (user_id, start_time, end_time)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;

        const values = [
            schedule.userId,
            schedule.startTime,
            schedule.endTime
        ];

        const result = await pool.query(insertQuery, values);

        return new Schedules(result.rows[0]);
    },

    update: async (schedule) => {
        const updateQuery = 
        `
        UPDATE schedules
        SET user_id = $1,
            start_time = $2,
            end_time = $3,
            updated_at = $4
        WHERE id = $5
        RETURNING *;
        `;

        const values = [
            schedule.userId,
            schedule.startTime,
            schedule.endTime,
            schedule.updatedAt,
            schedule.id
        ];

        const result = await pool.query(updateQuery, values);

        return new Schedules(result.rows[0]);
    },

    delete: async (id) => {
        const deleteQuery = 
        `
        DELETE FROM schedules
        WHERE id = $1;
        `;
        
        await pool.query(deleteQuery, [id]);
    }
};
