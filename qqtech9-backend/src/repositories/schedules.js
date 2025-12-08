import { pool } from '../config/database-conn.js';
import { Schedules } from '../models/schedules.js';

export const SchedulesRepository = {
    findUpcomingSchedules: async (date, userName, roleId, limit, offset) => {
        const selectQuery = 
        `
        SELECT 
            s.*,
            jsonb_build_object(
                'id', u.id,
                'email', u.email,
                'name', u.name,
                'profile', u.profile,
                'roles', COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', r.id,
                            'name', r.name,
                            'color', r.color
                        )
                    ) FILTER (WHERE r.id IS NOT NULL), '[]'::jsonb
                )
            ) AS user
        FROM schedules s
        JOIN users u
            ON s.user_id = u.id
        LEFT JOIN users_roles ur
            ON u.id = ur.user_id
        LEFT JOIN roles r
            ON ur.role_id = r.id
        WHERE 
            ($1 BETWEEN DATE(s.start_time) AND DATE(s.end_time) OR s.start_time > $1)
            AND ($2::varchar IS NULL OR u.name ILIKE '%' || $2 || '%')
            AND ($3::uuid IS NULL OR r.id = $3::uuid)
        GROUP BY s.id, u.id 
        ORDER BY start_time ASC, end_time ASC
        LIMIT $4 OFFSET $5;
        `;

        const values = [
            date,
            userName || null,
            roleId || null,
            limit,
            offset
        ];

        const result = await pool.query(selectQuery, values);
        
        return Schedules.fromArray(result.rows);
    },

    findCurrentScheduleByRolesId: async (rolesId, date) => {
        const selectQuery = 
        `
        SELECT s.* FROM schedules s
        JOIN users u 
            ON s.user_id = u.id
        WHERE 
            ur.role_id = ANY($1::uuid[])
            AND $2 BETWEEN s.start_time AND s.end_time
        ORDER BY s.start_time ASC, s.created_at ASC
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
