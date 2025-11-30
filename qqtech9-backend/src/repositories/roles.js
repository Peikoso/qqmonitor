import { pool } from '../config/database-conn.js';
import { Roles } from '../models/roles.js';

export const RolesRepository = {
    findAll: async () => {
        const result = await pool.query(
            `
            SELECT * FROM roles
            ORDER BY created_at DESC;
            `
        );

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
        (name, color, description)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;

        const values = [
            roleData.name,
            roleData.color,
            roleData.description
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
            updated_at = $4
        WHERE id = $5
        RETURNING *;
        `;

        const values = [
            roleData.name,
            roleData.color,
            roleData.description,
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