# backend/app/models/material.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    
    # Cascade ensures if a student profile is deleted, their uploaded notes are cleaned up too
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    
    # Cautious safety fallback: Nullable so scanned/bad PDFs don't trigger severe SQL errors
    extracted_text = Column(Text, nullable=True) 
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Bidirectional relationship: Links material rows to generated quizzes cleanly
    quizzes = relationship("Quiz", back_populates="material", cascade="all, delete-orphan")