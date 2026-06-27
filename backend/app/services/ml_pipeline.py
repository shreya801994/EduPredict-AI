# backend/app/services/ml_pipeline.py
from sqlalchemy.orm import Session
# 🚀 FIXED: Importing StudentProfile instead of UserProfile to match your schema!
from app.models.profile import StudentProfile 
from app.models.scores import SubjectScore 

def extract_student_features(student_id: int, db: Session):
    """
    Day 1: Database -> Feature Extractor Matrix Pipeline
    Fetches raw database records and compiles them into an analytics-ready feature map.
    """
    # 🚀 FIXED: Querying StudentProfile here to match your model structure
    profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
    
    # 2. Fetch academic course rows to dynamically evaluate performance metrics
    scores = db.query(SubjectScore).filter(SubjectScore.student_id == student_id).all()
    
    if not profile:
        return None

    # 3. Aggregate credit-weighted current SGPA
    grade_scale = {'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0}
    total_points = 0
    total_credits = 0
    
    for row in scores:
        points = grade_scale.get(row.grade, 7) # Fallback to standard baseline grade point
        total_points += (points * row.credits)
        total_credits += row.credits
        
    current_sgpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0

    # 4. Return clean, flat data mapping
    return {
        "age": int(profile.age),
        "attendance": float(profile.attendance),
        "study_hours": float(profile.study_hours),
        "sleep_hours": float(profile.sleep_hours),
        "family_support": 1 if profile.family_support.lower() == 'high' else 0,
        "internet_access": 1 if profile.internet_access.lower() == 'yes' else 0,
        "current_sgpa": current_sgpa
    }

def predict_student_performance(features: dict):
    """
    Day 2 & 3: Heuristic Analytics Calculation & Rule-Driven Recommendations
    Simulates ML inference and generates targeted interventions.
    """
    if not features:
        return None

    # 1. Day 2 Heuristic Scoring Formula (Normalized roughly to a 10.0 scale)
    simulated_score = (
        (features["current_sgpa"] * 0.5) +
        (min(features["study_hours"], 10) * 0.3) + 
        ((features["attendance"] / 10) * 0.1) +
        (min(features["sleep_hours"], 8) * 0.1)
    )
    
    # Bound the forecast realistically between a 0.0 floor and a 10.0 ceiling
    predicted_sgpa = round(max(min(simulated_score, 10.0), 0.0), 2)

    # 2. Assign Risk Classification Categories
    if predicted_sgpa >= 8.5:
        risk_level = "LOW"
    elif predicted_sgpa >= 6.5:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # 3. Day 3 Actionable Recommendations Engine
    recommendations = []
    if features["attendance"] < 75.0:
        recommendations.append("Critical Alert: Attendance is below 75% threshold. Prioritize lecture attendance immediately.")
    elif features["attendance"] < 85.0:
        recommendations.append("Target attendance improvements above 85% to maximize internal evaluation scores.")

    if features["study_hours"] < 3.0:
        recommendations.append("Daily independent study track is low. Target an allocation increase to 4.5 hours.")
        
    if features["sleep_hours"] < 6.0:
        recommendations.append("Rest deficit detected. Ensure 7+ hours of nightly sleep to maximize cognitive retention.")

    if not recommendations:
        recommendations.append("Current profile metrics balanced. Maintain consistency across your current active coursework.")

    # 4. Generate SHAP-style local explainability factors (Impact deltas)
    explainability = [
        {"factor": "Prior Academic Standing", "weight": "+50%", "description": f"Baseline established by your current {features['current_sgpa']} SGPA."},
        {"factor": "Study Time Allocation", "weight": "+30%", "description": f"Impact derived from committing {features['study_hours']} hours daily."},
        {"factor": "Class Presence Rate", "weight": "+10%", "description": f"Derived from your {features['attendance']}% attendance logs."}
    ]

    return {
        "predicted_sgpa": predicted_sgpa,
        "risk_level": risk_level,
        "explainability": explainability,
        "recommendations": recommendations
    }