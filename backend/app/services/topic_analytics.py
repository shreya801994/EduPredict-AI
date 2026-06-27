# backend/app/services/topic_analytics.py
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.models.quiz import QuizQuestion
from app.models.attempt import StudentQuizAttempt, StudentAnswer

class TopicAnalyticsService:
    @staticmethod
    def calculate_student_topics(student_id: int, db: Session) -> List[Dict[str, Any]]:
        """
        The single source of truth for computing topic mastery statistics across 
        all historical quiz responses for a specific student profile.
        """
        raw_topic_data = (
            db.query(
                QuizQuestion.topic.label("topic"),
                func.avg(StudentAnswer.grading_score).label("avg_score"),
                func.count(StudentAnswer.id).label("question_count")
            )
            .join(StudentAnswer, QuizQuestion.id == StudentAnswer.question_id)
            .join(StudentQuizAttempt, StudentQuizAttempt.id == StudentAnswer.attempt_id)
            .filter(QuizQuestion.topic.isnot(None))
            .filter(QuizQuestion.topic != "")
            .filter(StudentQuizAttempt.student_id == student_id)
            .group_by(QuizQuestion.topic)
            .all()
        )
        
        return [
            {
                "topic": row.topic,
                "mastery_percentage": round(float(row.avg_score) * 100.0, 2),
                "total_questions_answered": row.question_count
            }
            for row in raw_topic_data
        ]