from datetime import datetime, timezone
from sqlalchemy import Column, String, JSON, Float, Integer, DateTime
from app.db.models import Base


class CaseSnapshot(Base):
    __tablename__ = 'case_snapshots'
    request_id = Column(String, primary_key=True)
    payload = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class FeatureSnapshot(Base):
    __tablename__ = 'feature_snapshots'
    request_id = Column(String, primary_key=True)
    feature_json = Column(JSON, nullable=False)
    baseline_json = Column(JSON, nullable=False)
    vector_version = Column(String, nullable=False)

class RiskEvaluation(Base):
    __tablename__ = 'risk_evaluations'
    request_id = Column(String, primary_key=True)
    component_scores = Column(JSON, nullable=False)
    risk_score = Column(Integer, nullable=False)
    decision = Column(String, nullable=False)
    reason_codes = Column(JSON, nullable=False)
    expiry = Column(Float, nullable=False)

class TriageRecord(Base):
    __tablename__ = 'gemini_triage'
    request_id = Column(String, primary_key=True)
    payload = Column(JSON)
    prompt_version = Column(String)
    status = Column(String)

class EmployeeReview(Base):
    __tablename__ = 'employee_reviews'
    review_id = Column(String, primary_key=True)
    case_id = Column(String, index=True, nullable=False)
    payload = Column(JSON, nullable=False)

class AttemptRecord(Base):
    __tablename__ = 'access_attempts'
    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String)
    wallet = Column(String, index=True)
    resource_id = Column(String)
    ts = Column(Float, index=True)
    decision = Column(String)
