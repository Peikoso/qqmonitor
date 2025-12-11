import { pool } from '../config/database-conn.js';
import { Schedules } from '../models/schedules.js';

export const SchedulesRepository = {
    findUpcomingSchedules: async (
        isSuperadmin, adminRoles, nowLocal, userName, roleId, limit, offset
    ) => {
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
            (
                $1::boolean = true
                OR NOT EXISTS (
                    SELECT 1
                    FROM users_roles ur2
                    WHERE ur2.user_id = u.id
                    AND ur2.role_id NOT IN (SELECT unnest($2::uuid[]))
                )
            ) 
            AND (s.end_time >= $3)
            AND ($4::varchar IS NULL OR u.name ILIKE '%' || $4 || '%')
            AND ($5::uuid IS NULL OR r.id = $5::uuid)
        GROUP BY s.id, u.id 
        ORDER BY start_time ASC, end_time ASC
        LIMIT $6 OFFSET $7;
        `;

        const values = [
            isSuperadmin,
            adminRoles,
            nowLocal,
            userName || null,
            roleId || null,
            limit,
            offset
        ];

        const result = await pool.query(selectQuery, values);
        
        return Schedules.fromArray(result.rows);
    },

    findCurrentScheduleByRolesId: async (rolesId, nowLocal) => {
        const selectQuery = 
        `
        SELECT s.* FROM schedules s
        JOIN users u 
            ON s.user_id = u.id
        JOIN users_roles ur
            ON u.id = ur.user_id
        WHERE 
            ur.role_id = ANY($1::uuid[])
            AND $2 BETWEEN s.start_time AND s.end_time
        ORDER BY s.start_time ASC, s.created_at ASC
        LIMIT 1;
        `;

        const result = await pool.query(selectQuery, [rolesId, nowLocal]);

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
