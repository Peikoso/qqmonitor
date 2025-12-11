import { pool } from '../config/database-conn.js';
import { Roles } from '../models/roles.js';

export const RolesRepository = {
    findAll: async (isSuperadmin, roles, name, limit, offset) => {
        const selectQuery = 
        `
        SELECT * FROM roles
        WHERE 
            ($1::boolean = true OR id = ANY($2::uuid[]))
            AND ($3::varchar IS NULL OR name ILIKE '%' || $3 || '%')
        ORDER BY created_at DESC
        LIMIT $4 OFFSET $5;
        `
        const values = [
            isSuperadmin,
            roles?.length ? roles : null,
            name || null,
            limit || 99999,
            offset || 0
        ];

        const result = await pool.query(selectQuery, values);

        return Roles.fromArray(result.rows);
    },

    findById: async (id) => {
        const selectIdQuery =
        `
        SELECT * FROM roles
        WHERE id = $1
        `

        const result = await pool.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Roles(result.rows[0]);
    },

    create: async(roleData) => {
        const insertRoleQuery = 
        `
        INSERT INTO roles
        (name, color, description, is_superadmin)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;

        const values = [
            roleData.name,
            roleData.color,
            roleData.description, 
            roleData.isSuperadmin
        ];
        
        const roleDB = await pool.query(insertRoleQuery, values);

        return new Roles(roleDB.rows[0]);
    },

    update: async(roleData) => {
        const updateRoleQuery = 
        `
        UPDATE roles
        SET name = $1,
            color = $2,
            description = $3,
            is_superadmin = $4,
            updated_at = $5
        WHERE id = $6
        RETURNING *;
        `;

        const values = [
            roleData.name,
            roleData.color,
            roleData.description,
            roleData.isSuperadmin,
            roleData.updatedAt, 
            roleData.id
        ];

        const roleDB = await pool.query(updateRoleQuery, values);

        return new Roles(roleDB.rows[0]);
    },

    delete: async (id) => {
        const deleteRoleQuery =
        `
        DELETE FROM roles
        WHERE id = $1;
        `;

        await pool.query(deleteRoleQuery, [id]);
    }
};