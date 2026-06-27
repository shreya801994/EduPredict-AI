# backend/app/schemas/predict.py
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime

class PredictionHistoryResponse(BaseModel):
    id: int
    student_id: int
    calculated_current_sgpa: float
    predicted_next_sgpa: float
    risk_status: str
    feature_snapshot: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True