from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.history import PredictionHistory
from app.schemas.predict import PredictionHistoryResponse

from app.services.ml_pipeline import (
    extract_student_features,
    predict_student_performance
)

router = APIRouter()

GRADE_MAPPING = {
    "A+": 10.0,
    "A": 9.0,
    "B+": 8.0,
    "B": 7.0,
    "C+": 6.0,
    "C": 5.0,
    "D": 4.0,
    "F": 0.0,
}


@router.get("/metrics/{student_id}", status_code=status.HTTP_200_OK)
def get_student_metrics_and_log(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Executes prediction pipeline,
    stores history,
    returns analytics payload.
    """

    features = extract_student_features(student_id, db)

    if not features:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    analytics = predict_student_performance(features)

    current_calculated_sgpa = features["current_sgpa"]

    model_predicted_sgpa = analytics["predicted_sgpa"]

    calculated_risk = analytics["risk_level"]

    try:
        history_entry = PredictionHistory(
            student_id=student_id,
            calculated_current_sgpa=current_calculated_sgpa,
            predicted_next_sgpa=model_predicted_sgpa,
            risk_status=calculated_risk,
            feature_snapshot=features
        )

        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)

    except Exception as e:
        db.rollback()
        print(
            f"[ARCHITECT CRITICAL] "
            f"Pipeline writing execution failure: {str(e)}"
        )

    return {
        "features": features,
        "analytics": analytics
    }


@router.get(
    "/history/{student_id}",
    response_model=List[PredictionHistoryResponse]
)
def get_prediction_history(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetch prediction history timeline.
    """

    records = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.student_id == student_id
        )
        .order_by(
            PredictionHistory.timestamp.asc()
        )
        .all()
    )

    return records