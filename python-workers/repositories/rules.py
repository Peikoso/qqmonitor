from sqlalchemy import text
from config.database import get_session
from models.rules import Rules

class RulesRepository:
    @staticmethod
    async def find_by_id(rule_id):
        query = text(
        """
        SELECT * FROM rules r
        WHERE r.id = :rule_id
        """
        )
        
        async with get_session() as session:
            result = await session.execute(query, {"rule_id": rule_id})
            row = result.fetchone()
            
            if not row:
                return None
            
            rule_dict = dict(row._mapping)
            rule = Rules(**rule_dict)
            return rule

    async def update_disabled_status(rule_id, is_active ):
        query = text(
        """
        UPDATE rules
        SET is_active = :is_active
        WHERE id = :rule_id
        """
        )
        
        async with get_session() as session:
            await session.execute(query, {"rule_id": rule_id, "is_active": is_active})
            await session.commit()