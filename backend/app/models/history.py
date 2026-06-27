# backend/app/models/history.py
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON
from datetime import datetime
from app.db.session import Base 

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, index=True, nullable=False)
    
    # Execution Metrics
    calculated_current_sgpa = Column(Float, nullable=False)
    predicted_next_sgpa = Column(Float, nullable=False)
    risk_status = Column(String(50), nullable=False)
    
    # Core Feature Vector Audit Snapshot
    feature_snapshot = Column(JSON, nullable=False) 
    
    timestamp = Column(DateTime, default=datetime.utcnow)