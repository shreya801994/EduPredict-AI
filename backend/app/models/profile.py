from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class StudentProfile(Base):
    __tablename__ = "student_profile"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Machine Learning Feature Attributes
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    attendance = Column(Float, nullable=False)      # Feature: e.g., 78.5
    study_hours = Column(Float, nullable=False)     # Feature: hours per day
    sleep_hours = Column(Float, nullable=False)     # Feature: hours per night
    family_support = Column(String, nullable=False) # Feature: "Low", "Medium", "High"
    internet_access = Column(String, nullable=False) # Feature: "Yes", "No"