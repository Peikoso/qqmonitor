from datetime import datetime
from sqlalchemy import UUID, Column, Integer, String, DateTime, Text, func, ForeignKey
from config.database import Base

class Runners(Base):
    __tablename__ = 'runners'

    id = Column(UUID, primary_key=True)
    rule_id = Column(UUID, ForeignKey('rules.id'))
    status = Column(String)
    last_run_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


    rule = None

    @staticmethod
    def from_array(runners_array):
        return [Runners(**runner) if isinstance(runner, dict) else runner for runner in runners_array]

    def update_status(self, status):
        self.status = status
        return self

    def idle(self):
        self.status = 'IDLE'
        self.last_run_at = datetime.now()
        return self

    def fail(self):
        self.status = 'ERROR'
        self.last_run_at = datetime.now()
        return self


class RunnerQueue(Base):
    __tablename__ = 'runner_queue'

    id = Column(UUID, primary_key=True)
    runner_id = Column(UUID, ForeignKey('runners.id'))
    status = Column(String, default='PENDING')
    scheduled_for = Column(DateTime)
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    attempt_count = Column(Integer, default=0)

    # Campo virtual para rule
    rule = None

    def start(self):
        self.status = 'PROCESSING'
        self.started_at = datetime.now()
        return self

    def complete(self):
        self.status = 'COMPLETED'
        self.finished_at = datetime.now()
        return self

    def fail(self, attempt_count):
        self.status = 'FAILED'
        self.finished_at = datetime.now()
        self.attempt_count = attempt_count
        return self

    def retry(self, attempt_count):
        self.status = 'PENDING'
        self.attempt_count = attempt_count
        self.started_at = None
        self.finished_at = None
        return self

    @staticmethod
    def from_array(runner_queue_array):
        return [RunnerQueue(**rq) if isinstance(rq, dict) else rq for rq in runner_queue_array]


class RunnerLogs(Base):
    __tablename__ = 'runner_logs'

    id = Column(UUID, primary_key=True)
    runner_id = Column(UUID, ForeignKey('runners.id'))
    queue_id = Column(UUID, ForeignKey('runner_queue.id'))
    run_time_ms = Column(Integer)
    execution_status = Column(String)
    rows_affected = Column(Integer)
    result = Column(Text)
    error = Column(Text)
    executed_at = Column(DateTime, server_default=func.now())

    rule = None

    @staticmethod
    def from_array(runner_logs_array):
        return [RunnerLogs(**rl) if isinstance(rl, dict) else rl for rl in runner_logs_array]
