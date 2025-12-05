import { pool } from '../config/database-conn.js'
import { Incidents, IncidentsLogs } from '../models/incidents.js'

export const IncidentsRepository = {
    findAll: async (
        status, ruleId, priority, profile, roles, roleId, limit, offset
    ) => {
        const selectQuery = 
        `
        SELECT 
            i.*,     
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', ro.id,
                        'name', ro.name,
                        'color', ro.color
                    )
                ) FILTER (WHERE ro.id IS NOT NULL),
                '[]'::jsonb
            ) AS roles,
            CASE 
                WHEN r.id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', r.id,
                        'name', r.name
                    )
                ELSE NULL
            END AS rule
        FROM incidents i
        LEFT JOIN rules r 
            ON i.rule_id = r.id
        LEFT JOIN rules_roles rr
            ON r.id = rr.rule_id
        LEFT JOIN roles ro
            ON rr.role_id = ro.id
        WHERE 
            ($1::varchar IS NULL OR i.status = $1)
            AND ($2::varchar IS NULL OR r.name ILIKE '%' || $2 || '%')
            AND ($3::varchar IS NULL OR i.priority = $3)
            AND (
                $4::varchar = 'admin'
                OR (
                    $5::uuid[] IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM rules_roles rr_auth
                        WHERE rr_auth.rule_id = i.rule_id
                        AND rr_auth.role_id = ANY($5::uuid[])
                    )
                )
            )
            AND (
                $6::uuid IS NULL 
                OR EXISTS (
                    SELECT 1 
                    FROM rules_roles rr_filter 
                    WHERE rr_filter.rule_id = i.rule_id 
                    AND rr_filter.role_id = $6
                )
            )
        GROUP BY i.id, r.id
        ORDER BY i.created_at DESC
        LIMIT $7 OFFSET $8;
        `;

        const values = [
            status || null,
            ruleId || null,
            priority || null,
            profile,
            roles?.length ? roles : null,
            roleId || null,
            limit,
            offset,
        ];

        const result = await pool.query(selectQuery, values);

        return Incidents.fromArray(result.rows);
    },

    findById: async(id, client = pool) => {
        const selectIdQuery =
        `
        SELECT 
            i.*, 
            array_remove(array_agg(ro.id), NULL) AS roles,
            CASE 
                WHEN r.id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', r.id,
                        'name', r.name
                    )
                ELSE NULL
            END AS rule
        FROM incidents i
        LEFT JOIN rules r 
            ON i.rule_id = r.id
        LEFT JOIN rules_roles rr
            ON r.id = rr.rule_id
        LEFT JOIN roles ro
            ON rr.role_id = ro.id
        WHERE i.id = $1
        GROUP BY i.id, r.id;
        
        `;

        const result = await client.query(selectIdQuery, [id]);

        if(!result.rows[0]){
            return null;
        }

        return new Incidents(result.rows[0]);
    },

    create: async(incident) => {
        const insertIncidentQuery =
        `
        INSERT INTO incidents
        (rule_id, status, priority)
        VALUES ($1, $2, $3)
        RETURNING *;
        `

        const values = [
            incident.ruleId,
            incident.status,
            incident.priority
        ]

        const result = await pool.query(insertIncidentQuery, values);

        return new Incidents(result.rows[0]);

    },

    update: async(incident, client) => {
        const updateIncidentQuery =
        `
        UPDATE incidents
        SET assigned_user_id = $1,
            rule_id = $2,
            status = $3,
            priority = $4,
            ack_at = $5,
            closed_at = $6,
            updated_at = $7
        WHERE id = $8
        RETURNING *;
        `;
        const values = [
            incident.assignedUserId,
            incident.ruleId,
            incident.status,
            incident.priority,
            incident.ackAt,
            incident.closedAt,
            incident.updatedAt,
            incident.id
        ];
        const result = await client.query(updateIncidentQuery, values);

        return new Incidents(result.rows[0]);
    }
};

export const IncidentsLogsRepository = {
    findByIncidentId: async (incidentId) => {
        const selectByIncidentIdQuery =
        `
        SELECT 
            ie.*,
            jsonb_build_object(
                'id', u.id,
                'name', u.name
            ) AS action_user
        FROM incidents_events ie
        LEFT JOIN users u
            ON ie.action_user_id = u.id
        WHERE incident_id = $1
        ORDER BY created_at DESC;
        `;

        const result = await pool.query(selectByIncidentIdQuery, [incidentId]);

        return IncidentsLogs.fromArray(result.rows);
    },

    create: async(incidentsLogs, client) => {
        const insertIncidentsLogsQuery =
        `
        INSERT INTO incidents_events
        (incident_id, previous_status, current_status, comment, action_user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `
        const values = [
            incidentsLogs.incidentId,
            incidentsLogs.previousStatus,
            incidentsLogs.currentStatus,
            incidentsLogs.comment,
            incidentsLogs.actionUserId
        ]
        const result = await client.query(insertIncidentsLogsQuery, values);

        return new IncidentsLogs(result.rows[0]);
    }

};