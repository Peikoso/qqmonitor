from sqlalchemy import UUID, Column, Integer, String, Text, Boolean, DateTime, Time, func
from config.database import Base

class Rules(Base):
    __tablename__ = 'rules'

    id = Column(UUID, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    database_type = Column(String)
    sql = Column(Text)
    priority = Column(String)
    execution_interval_ms = Column(Integer)
    max_error_count = Column(Integer)
    timeout_ms = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)
    is_active = Column(Boolean, default=True)
    silence_mode = Column(Boolean, default=False)
    postpone_date = Column(DateTime)
    user_creator_id = Column(UUID)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    roles = None

    @staticmethod
    def from_array(rules_array):
        return [Rules(**rule) if isinstance(rule, dict) else rule for rule in rules_array]
