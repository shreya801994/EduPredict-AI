# backend/app/models/quiz.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("study_materials.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Bidirectional relationships
    material = relationship("StudyMaterial", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("StudentQuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(String, nullable=False)
    question_type = Column(String, nullable=False)  # "MCQ" or "SHORT_ANSWER"
    options = Column(JSON, nullable=True)           # List of strings for MCQ, null for short answer
    correct_answer = Column(String, nullable=False)
    difficulty = Column(String, nullable=False, default="medium")     # "easy", "medium", "hard"
    topic = Column(String, nullable=False)          # Dynamically parsed topic string
    source_excerpt = Column(String, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("StudentAnswer", back_populates="question", cascade="all, delete-orphan")