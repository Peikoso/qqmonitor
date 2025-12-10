from sqlalchemy import text
from config.database import get_session
from models.escalation import EscalationPolicy, EscalationSteps

class EscalationRepository:
    @staticmethod
    async def get_policy():
        async with get_session() as session:
            query = text(
            """
            SELECT *
            FROM escalation_policy
            LIMIT 1;
            """
            )
            
            result = await session.execute(query)
            row = result.fetchone()
            
            if not row:
                return None
            
            return EscalationPolicy(**dict(row._mapping))
        
    @staticmethod
    async def create_step(escalation_step):
        async with get_session() as session:
            query = text(
            """
            INSERT INTO escalation_steps (incident_id, user_id, escalation_order, escalated_at, result)
            VALUES (:incident_id, :user_id, :escalation_order, NOW(), :result);
            """
            )
            
            query = query.bindparams(
                incident_id = escalation_step.incident_id,
                user_id = escalation_step.user_id,
                escalation_order = escalation_step.escalation_order,
                result = escalation_step.result
            )
            
            await session.execute(query)
            await session.commit()
            
    @staticmethod
    async def update_step(escalation_step):
        ...
        
    @staticmethod
    async def get_next_order(incident_id):
        async with get_session() as session:
            query = text(
            """
            SELECT COALESCE(MAX(escalation_order), 0) + 1 AS next_order
            FROM escalation_steps
            WHERE incident_id = :incident_id;
            """
            )
            
            query = query.bindparams(
                incident_id = incident_id
            )
            
            result = await session.execute(query)
            row = result.fetchone()
            
            return row.next_order if row else 1