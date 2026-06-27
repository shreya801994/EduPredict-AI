# backend/app/api/v1/endpoints/attempts.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

# Database Session Context
from app.db.session import get_db

# Core Relational DB Models
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion
from app.models.material import StudyMaterial
from app.models.attempt import StudentQuizAttempt, StudentAnswer 

# Schema Transport Layer
from app.schemas.attempt import (
    QuizSubmissionRequest, 
    QuizAttemptResponse,
    StudentAttemptHistoryItem,
    AttemptDetailResponse,
    StudentAnalyticsResponse,
    StudentTopicAnalyticsResponse,
    StudentRemediationResponse,
    TopicRecommendationItem,
    RecommendedMaterialItem
)

# Core Logic Services
from app.services.grading_engine import GradingEngineService
from app.services.topic_analytics import TopicAnalyticsService

router = APIRouter()

# Global Performance Guardrails
WEAK_TOPIC_THRESHOLD = 60.0
MIN_TOPIC_ATTEMPTS = 3  # 🛡️ Prevents knee-jerk alerts based on shallow question counts

# ==========================================
# ROUTE 1: SUBMIT ATTEMPT (WRITE/GRADE)
# ==========================================
@router.post(
    "/submit", 
    response_model=QuizAttemptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a completed quiz attempt with complete validation"
)
def submit_quiz_attempt(payload: QuizSubmissionRequest, db: Session = Depends(get_db)):
    """
    Ingests itemized student answers using a highly defensive 'Validate-Grade-Persist' pipeline.
    Ensures zero database mutation or session churn occurs until all data logic has 
    completely passed schema constraints and evaluation pipelines conclude.
    """
    if not payload.answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission payload rejected. An exam attempt must contain at least one answer."
        )

    seen_question_ids = set()
    for ans in payload.answers:
        if ans.question_id in seen_question_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payload. Question ID {ans.question_id} was submitted multiple times."
            )
        seen_question_ids.add(ans.question_id)

    student_exists = db.query(User.id).filter(User.id == payload.student_id).first()
    if not student_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Access Denied. Student profile with ID {payload.student_id} does not exist."
        )

    quiz = db.query(Quiz).filter(Quiz.id == payload.quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz profile with ID {payload.quiz_id} does not exist."
        )

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == payload.quiz_id).all()
    question_map = {q.id: q for q in questions}

    for answer_submission in payload.answers:
        target_question = question_map.get(answer_submission.question_id)
        if not target_question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Data contamination. Question ID {answer_submission.question_id} does not belong to Quiz ID {payload.quiz_id}."
            )
            
        q_type = (target_question.question_type or "").upper()
        
        if q_type == "MCQ":
            if not answer_submission.selected_option or not answer_submission.selected_option.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Validation error for Question ID {answer_submission.question_id}: Multiple Choice Questions require a 'selected_option' value."
                )
        elif q_type in ["SHORT_ANSWER", "LONG_ANSWER"]:
            if not answer_submission.provided_text or not answer_submission.provided_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Validation error for Question ID {answer_submission.question_id}: Written response questions require a 'provided_text' value."
                )

    started_at_timestamp = datetime.now(timezone.utc)
    total_accumulated_score = 0.0
    graded_results_manifest = []

    for answer_submission in payload.answers:
        target_question = question_map[answer_submission.question_id]
        evaluation = GradingEngineService.grade_answer(target_question, answer_submission)

        raw_score = evaluation.get("grading_score", 0.0)
        is_correct_flag = bool(evaluation.get("is_correct", False))
        ai_feedback_str = evaluation.get("ai_feedback", "Evaluation processed successfully.")

        score_rewarded = max(0.0, min(1.0, float(raw_score)))
        total_accumulated_score += score_rewarded

        graded_results_manifest.append({
            "submission": answer_submission,
            "is_correct": is_correct_flag,
            "grading_score": score_rewarded,
            "ai_feedback": ai_feedback_str,
            "difficulty": target_question.difficulty or "medium"
        })

    final_percentage = (total_accumulated_score / len(payload.answers)) * 100.0
    completed_at_timestamp = datetime.now(timezone.utc)

    try:
        new_attempt = StudentQuizAttempt(
            quiz_id=payload.quiz_id,
            student_id=payload.student_id,
            score=round(final_percentage, 2),
            started_at=started_at_timestamp,
            completed_at=completed_at_timestamp
        )
        db.add(new_attempt)
        db.flush()

        for item in graded_results_manifest:
            sub = item["submission"]
            answer_log = StudentAnswer(
                attempt_id=new_attempt.id,
                question_id=sub.question_id,
                selected_option=sub.selected_option,
                provided_text=sub.provided_text,
                is_correct=item["is_correct"],
                grading_score=item["grading_score"],
                ai_feedback=item["ai_feedback"],
                question_difficulty=item["difficulty"]
            )
            db.add(answer_log)

        db.commit()
        db.refresh(new_attempt)
        _ = new_attempt.answers

    except Exception:
        db.rollback()
        raise 

    return {
        "attempt_id": new_attempt.id,
        "quiz_id": new_attempt.quiz_id,
        "student_id": new_attempt.student_id,
        "score": new_attempt.score,
        "started_at": new_attempt.started_at,
        "completed_at": new_attempt.completed_at,
        "answers": new_attempt.answers
    }

# ==========================================
# ROUTE 2: GENERAL ANALYTICS SUMMARY (READ)
# ==========================================
@router.get(
    "/student/{student_id}/analytics",
    response_model=StudentAnalyticsResponse,
    summary="Generate high-level performance metrics for a student dashboard"
)
def get_student_analytics(student_id: int, db: Session = Depends(get_db)):
    """Queries and computes performance high-water marks for a student dashboard."""
    student_exists = db.query(User.id).filter(User.id == student_id).first()
    if not student_exists:
        raise HTTPException(status_code=404, detail="Student profile does not exist.")

    from sqlalchemy import func
    analytics_query = (
        db.query(
            func.count(StudentQuizAttempt.id).label("total_attempts"),
            func.avg(StudentQuizAttempt.score).label("average_score"),
            func.max(StudentQuizAttempt.score).label("best_score"),
            func.min(StudentQuizAttempt.score).label("worst_score")
        )
        .filter(StudentQuizAttempt.student_id == student_id)
        .first()
    )

    if not analytics_query or analytics_query.total_attempts == 0:
        return {"total_attempts": 0, "average_score": 0.0, "best_score": 0.0, "worst_score": 0.0}

    return {
        "total_attempts": analytics_query.total_attempts,
        "average_score": round(float(analytics_query.average_score), 2),
        "best_score": round(float(analytics_query.best_score), 2),
        "worst_score": round(float(analytics_query.worst_score), 2)
    }

# ==========================================
# ROUTE 3: GRANULAR TOPIC ANALYTICS (READ)
# ==========================================
@router.get(
    "/student/{student_id}/topics",
    response_model=StudentTopicAnalyticsResponse,
    summary="Calculate granular topic mastery and pinpoint focus areas"
)
def get_student_topic_analytics(student_id: int, db: Session = Depends(get_db)):
    """Loads consolidated analytics and flags subjects dropping below safety levels."""
    student_exists = db.query(User.id).filter(User.id == student_id).first()
    if not student_exists:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    # Shared Engine Call
    all_topics = TopicAnalyticsService.calculate_student_topics(student_id, db)
    
    weak_areas = [
        {"topic": t["topic"], "mastery_percentage": t["mastery_percentage"]}
        for t in all_topics if t["mastery_percentage"] < WEAK_TOPIC_THRESHOLD
    ]

    all_topics.sort(key=lambda x: x["username" if "username" in x else "mastery_percentage"], reverse=True)

    return {
        "student_id": student_id,
        "topic_mastery": all_topics,
        "weak_areas": weak_areas
    }

# ==========================================
# ROUTE 4: REMEDIATION RECOMMENDATIONS (READ)
# ==========================================
@router.get(
    "/student/{student_id}/recommendations",
    response_model=StudentRemediationResponse,
    summary="Generate targeted study material recommendations based on weak areas"
)
def get_student_study_recommendations(student_id: int, db: Session = Depends(get_db)):
    """Traces struggling performance topics back to their ancestral source documents."""
    student_exists = db.query(User.id).filter(User.id == student_id).first()
    if not student_exists:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    # Shared Engine Call
    all_topics = TopicAnalyticsService.calculate_student_topics(student_id, db)
    remedial_roadmap = []

    for t in all_topics:
        # 🛡️ Statistical Gate: Ignore topic variations that lack data volume history
        if t.get("total_questions_answered", 0) < MIN_TOPIC_ATTEMPTS:
            continue

        if t["mastery_percentage"] < WEAK_TOPIC_THRESHOLD:
            # Explicitly utilizes imported Quiz and QuizQuestion models inside the JOIN structure
            matched_materials = (
                db.query(StudyMaterial.id, StudyMaterial.title)
                .join(Quiz, Quiz.material_id == StudyMaterial.id)
                .join(QuizQuestion, QuizQuestion.quiz_id == Quiz.id)
                .filter(QuizQuestion.topic == t["topic"])
                .distinct()
                .all()
            )

            recommendations = [
                RecommendedMaterialItem(
                    material_id=mat.id,
                    title=mat.title,
                    relevance_reason=f"Contains core reference materials covering '{t['topic']}'."
                )
                for mat in matched_materials
            ]

            remedial_roadmap.append(
                TopicRecommendationItem(
                    topic=t["topic"],
                    mastery_percentage=t["mastery_percentage"],
                    recommended_materials=recommendations
                )
            )

    remedial_roadmap.sort(key=lambda x: x.mastery_percentage)

    return {
        "student_id": student_id,
        "remedial_roadmap": remedial_roadmap
    }

# ==========================================
# ROUTE 5: STUDENT PROFILE HISTORY (READ)
# ==========================================
@router.get(
    "/student/{student_id}", 
    response_model=List[StudentAttemptHistoryItem],
    summary="Retrieve history log profiles for a specific student"
)
def get_student_attempt_history(student_id: int, db: Session = Depends(get_db)):
    """Fetches a chronological list of all completed attempts for a single student."""
    student_exists = db.query(User.id).filter(User.id == student_id).first()
    if not student_exists:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    attempts = (
        db.query(StudentQuizAttempt)
        .filter(StudentQuizAttempt.student_id == student_id)
        .order_by(StudentQuizAttempt.completed_at.desc())
        .all()
    )

    return [
        {"attempt_id": att.id, "quiz_id": att.quiz_id, "score": att.score, "completed_at": att.completed_at}
        for att in attempts
    ]

# ==========================================
# ROUTE 6: ATTEMPT REVIEW DETAILS (READ)
# ==========================================
@router.get(
    "/{attempt_id}", 
    response_model=AttemptDetailResponse,
    summary="Fetch comprehensive evaluation review for a unique attempt"
)
def get_attempt_details(attempt_id: int, db: Session = Depends(get_db)):
    """Retrieves the complete breakdown of a specific attempt for quiz reviews."""
    attempt = db.query(StudentQuizAttempt).filter(StudentQuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt record was not found.")

    _ = attempt.answers

    return {
        "attempt_id": attempt.id,
        "quiz_id": attempt.quiz_id,
        "student_id": attempt.student_id,
        "score": attempt.score,
        "started_at": attempt.started_at,
        "completed_at": attempt.completed_at,
        "answers": attempt.answers
    }