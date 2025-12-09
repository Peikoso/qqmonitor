from sqlalchemy import Column, Integer, DateTime, UUID, String
from config.database import Base


class EscalationPolicy(Base):
    __tablename__ = 'escalation_policy'
    
    id = Column(UUID, primary_key=True)
    timeout_ms = Column(Integer)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    @staticmethod
    def from_array(policies_array):
        return [EscalationPolicy(**policy) if isinstance(policy, dict) else policy for policy in policies_array]
        

class EscalationSteps(Base):
    __tablename__ = 'escalation_steps'
    
    id = Column(UUID, primary_key=True)
    incident_id = Column(UUID)
    user_id = Column(UUID)
    escalation_order = Column(Integer)
    escalated_at = Column(DateTime)
    result = Column(String)
    
    @staticmethod
    def from_array(history_array):
        return [EscalationSteps(**history) if isinstance(history, dict) else history for history in history_array]