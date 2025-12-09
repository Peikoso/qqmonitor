from sqlalchemy import UUID, Column, Integer, String, Text, Boolean, DateTime, Time, func
from config.database import Base

class Schedules(Base):
    __tablename__ = 'schedules'

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    
    @staticmethod
    def from_array(schedules_array):
        return [Schedules(**schedule) if isinstance(schedule, dict) else schedule for schedule in schedules_array]