# backend/app/models/attempt.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion

class StudentQuizAttempt(Base):
    __tablename__ = "student_quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    score = Column(Float, nullable=False, default=0.0)  
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # 🤝 Bi-directional anchors
    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="attempts")
    answers = relationship("StudentAnswer", back_populates="attempt", cascade="all, delete-orphan")


class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("student_quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False)
    
    selected_option = Column(Text, nullable=True)  
    provided_text = Column(Text, nullable=True)
         
    is_correct = Column(Boolean, nullable=False, default=False)
    ai_feedback = Column(Text, nullable=True)
    
    # Grading Analytics and question difficulty 
    grading_score = Column(Float, nullable=False, default=0.0)
    question_difficulty = Column(String(20), nullable=False, default="medium")

    # Bi-directional anchors
    attempt = relationship("StudentQuizAttempt", back_populates="answers")
    question = relationship("QuizQuestion", back_populates="answers")