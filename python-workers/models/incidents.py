from sqlalchemy import Column, String, DateTime, UUID, Integer, ARRAY
from config.database import Base


class Incidents(Base):
    __tablename__ = 'incidents'
    
    id = Column(UUID, primary_key=True)
    assigned_user_id = Column(UUID)
    rule_id = Column(UUID)
    status = Column(String)
    priority = Column(String)
    ack_at = Column(DateTime)
    closed_at = Column(DateTime)
    escalation_level = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    roles_ids = Column(ARRAY(UUID))
    
    @staticmethod
    def from_array(incidents_array):
        return [Incidents(**incident) if isinstance(incident, dict) else incident for incident in incidents_array]
    
    