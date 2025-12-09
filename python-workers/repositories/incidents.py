from sqlalchemy import text
from config.database import get_session
from models.incidents import Incidents


class IncidentsRepository:
    @staticmethod
    async def find_expired_incidents(timeout_ms):
        async with get_session() as session:
            query = text(
            """
            SELECT 
                i.*, 
                array_remove(array_agg(rr.role_id), NULL) AS roles_ids
            FROM incidents i
            LEFT JOIN rules r
                ON i.rule_id = r.id
            LEFT JOIN rules_roles rr
                ON r.id = rr.rule_id
            LEFT JOIN escalation_steps es
                ON i.id = es.incident_id
            WHERE i.status = 'OPEN'
            GROUP BY i.id
            HAVING NOW() >= COALESCE(MAX(es.escalated_at), i.created_at) + (:timeout_ms * INTERVAL '1 millisecond')
            ORDER BY i.created_at ASC;
            """
            )
            
            query = query.bindparams(
                timeout_ms = timeout_ms
            )
            
            result = await session.execute(query)
            rows = result.fetchall()
            
            incidents = Incidents.from_array([dict(row._mapping) for row in rows])
            
            return incidents
        
    @staticmethod
    async def update_assigned_user(incident_id, user_id):
        async with get_session() as session:
            query = text(
            """
            UPDATE incidents
            SET assigned_user_id = :user_id,
                updated_at = NOW()
            WHERE id = :incident_id
            RETURNING *;
            """
            )
            
            query = query.bindparams(
                incident_id = incident_id,
                user_id = user_id
            )
            
            result = await session.execute(query)
            row = result.fetchone()
            await session.commit()
            
            return Incidents(**dict(row._mapping))        