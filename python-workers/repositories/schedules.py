from sqlalchemy import text
from config.database import get_session
from models.schedules import Schedules

class SchedulesRepository:
    @staticmethod
    async def find_next_to_escalate(rule_id, incident_id):
        async with get_session() as session:
            query = text(
            """
            SELECT s.*
            FROM schedules s
            JOIN users u 
                ON u.id = s.user_id
            JOIN users_roles ur 
                ON ur.user_id = u.id
            WHERE ur.role_id IN (
                    SELECT rr.role_id 
                    FROM rules r
                    JOIN rules_roles rr ON rr.rule_id = r.id
                    WHERE r.id = :rule_id
                )
                AND u.pending = false
                AND s.start_time <= NOW() 
                AND u.id NOT IN (
                SELECT user_id 
                    FROM escalation_steps 
                    WHERE incident_id = :incident_id
                )
            ORDER BY s.start_time ASC
            LIMIT 1;
            """
            )
            
            query = query.bindparams(
                rule_id = rule_id,
                incident_id = incident_id
            )
            
            result = await session.execute(query)
            row = result.fetchone()
            
            if not row:
                return None
            
            return Schedules(**dict(row._mapping))
                