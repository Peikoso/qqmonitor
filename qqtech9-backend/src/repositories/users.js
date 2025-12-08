import { pool } from '../config/database-conn.js';
import { Users } from '../models/users.js'

export const UsersRepository = {
    findAll: async (name, matricula, role, pending, profile, limit, offset) => {
        const selectQuery =
        `
        SELECT 
            u.*, 
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', r.id,
                        'name', r.name,
                        'color', r.color
                    )
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'::jsonb
            ) AS roles 
        FROM users u 
        LEFT JOIN users_roles ur
            ON u.id = ur.user_id
        LEFT JOIN roles r
            ON ur.role_id = r.id
        WHERE
            ($1::varchar IS NULL OR u.name ILIKE '%' || $1 || '%')
            AND ($2::varchar IS NULL OR u.matricula ILIKE '%' || $2 || '%')
            AND ($3::uuid IS NULL OR r.id = $3)
            AND ($4::boolean IS NULL OR u.pending = $4)
            AND ($5::varchar IS NULL OR u.profile = $5)
        GROUP BY u.id
        ORDER BY created_at DESC
        LIMIT $6 OFFSET $7;
        `;

        const values = [
            name || null, 
            matricula || null,
            role || null,
            pending || null,
            profile || null,
            limit,
            offset
        ];

        const result = await pool.query(selectQuery, values);

        return Users.fromArray(result.rows);
    },

    findById: async (id) => {
        const selectIdQuery = 
        `
        SELECT 
            u.*, array_remove(array_agg(ur.role_id), NULL) AS roles
        FROM users u 
        LEFT JOIN users_roles ur
            ON u.id = ur.user_id
        WHERE u.id = $1
        GROUP BY u.id;
        `

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Users(result.rows[0]);
    },

    findByFirebaseId: async (id) => {
        const selectIdQuery = 
        `
        SELECT 
            u.*, 
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', r.id,
                        'name', r.name,
                        'color', r.color
                    )
                ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'::jsonb
            ) AS roles 
        FROM users u 
        LEFT JOIN users_roles ur
            ON u.id = ur.user_id
        LEFT JOIN roles r
            ON ur.role_id = r.id
        WHERE u.firebase_id = $1
        GROUP BY u.id;
        `

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Users(result.rows[0]);
    },

    findAllwithBasicInfo: async (name) => {
        const selectQuery = 
        `
        SELECT 
            u.id, u.name, u.matricula, u.email, u.profile,
            COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', r.id,
                            'name', r.name,
                            'color', r.color
                        )
                    ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'::jsonb
                ) AS roles 
        FROM users u
        LEFT JOIN users_roles ur
            ON u.id = ur.user_id
        LEFT JOIN roles r
            ON ur.role_id = r.id
        WHERE
            u.pending = false 
            AND ($1::varchar IS NULL OR u.name ILIKE '%' || $1 || '%')
        GROUP BY u.id;
        `;

        const result = await pool.query(selectQuery, [name || null]);

        return Users.fromArray(result.rows);
    },

    findEligibleUsersForEscalation: async (rolesId) => {
        const selectQuery = 
        `
        SELECT
            u.id, u.name, u.email
        FROM users u
        LEFT JOIN users_roles ur 
            ON u.id = ur.user_id
        LEFT JOIN roles r
            ON ur.role_id = r.id
        WHERE
            u.pending = false
            AND u.profile != 'viewer'
            AND ur.role_id = ANY($1::uuid[])
        `

        const result = await pool.query(selectQuery, [rolesId]);

        return Users.fromArray(result.rows);
    },

    create: async(user) =>{
        const client =  await pool.connect();
        
        try{
            await client.query('BEGIN');

            const insertUserQuery = 
            `
            INSERT INTO users
            (firebase_id, name, matricula, email, profile, pending)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
            `;

            const values = [
                user.firebaseId,
                user.name,
                user.matricula,
                user.email,
                user.profile,
                user.pending,
            ];
            
            const userDB = await client.query(insertUserQuery, values);

            const insertUserRoleQuery = `INSERT INTO users_roles (user_id, role_id) VALUES ($1, $2)`;

            for (const roleId of user.roles){
                await client.query(insertUserRoleQuery, [userDB.rows[0].id, roleId])
            }

            const userWithRolesQuery =
            `
            SELECT u.*, array_remove(array_agg(ur.role_id), NULL) AS roles
            FROM users u
            LEFT JOIN users_roles ur
            ON u.id = ur.user_id
            WHERE u.id = $1
            GROUP BY u.id;
            `;

            const result = await client.query(userWithRolesQuery, [userDB.rows[0].id]);

            await client.query('COMMIT');
            
            return new Users(result.rows[0]);

        } catch (error){
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    },

    update: async (user) => {
        const client =  await pool.connect();

        try{
            await client.query('BEGIN');
            const fields = [];
            const values = [];
            let i = 1;

            for (const [key, value] of Object.entries(user)) {
                if (key === "id" || key === "roles") continue;
                if (value === undefined) continue;

                if (key === 'firebaseId') {
                    fields.push(`firebase_id = $${i}`);
                    values.push(value);
                    i++;
                    continue;
                }

                if (key === 'createdAt') {
                    fields.push(`created_at = $${i}`);
                    values.push(value);
                    i++;
                    continue;
                }


                if (key === 'updatedAt') {
                    fields.push(`updated_at = $${i}`);
                    values.push(value);
                    i++;
                    continue;
                }

                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }

            values.push(user.id); // último é o id

            const sql = `
                UPDATE users
                SET ${fields.join(', ')}
                WHERE id = $${i}
                RETURNING *;
            `;

            const result = await client.query(sql, values);

            const deleteUserRolesQuery = `DELETE FROM users_roles WHERE user_id = $1`;
            await client.query(deleteUserRolesQuery, [user.id]);

            const insertUserRoleQuery = `INSERT INTO users_roles (user_id, role_id) VALUES ($1, $2)`;
            for (const roleId of user.roles){
                await client.query(insertUserRoleQuery, [user.id, roleId])
            }

            await client.query('COMMIT');

            return new Users(result.rows[0]);

        } catch (error){
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    delete: async (id) => {
        const deleteUserQuery = `
            DELETE FROM users
            WHERE id = $1;
        `;
        
        await pool.query(deleteUserQuery, [id]);
    }
};