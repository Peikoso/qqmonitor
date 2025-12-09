
from sqlalchemy import Boolean, Column, String, UUID
from config.database import Base


class Users(Base):
    __tablename__ = 'users'
    
    id = Column(UUID, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    profile = Column(String)
    pending = Column(Boolean)
    
    @staticmethod
    def from_array(users_array):
        return [Users(**user) if isinstance(user, dict) else user for user in users_array]