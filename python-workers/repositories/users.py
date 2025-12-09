from sqlalchemy import  text
from config.database import get_session
from models.users import Users

class UsersRepository:
    @staticmethod
    async def find_admin_with_role(incident_roles):
        async with get_session() as session:
            query = text(
            """
            SELECT u.id, u.name, u.email
            FROM users u
            JOIN users_roles ur 
                ON ur.user_id = u.id
            WHERE ur.role_id = ANY(:role_ids)
                AND u.profile = 'admin'
                AND u.pending = false
            """
            )
            
            query = query.bindparams(
                role_ids = incident_roles
            )
            
            result = await session.execute(query)
            rows = result.fetchall()
            
            return Users.from_array([dict(row._mapping) for row in rows])

