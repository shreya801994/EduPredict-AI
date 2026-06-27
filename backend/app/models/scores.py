from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.db.session import Base

class SubjectScore(Base):
    __tablename__ = "subject_scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    subject = Column(String, nullable=False)
    grade = Column(String, nullable=False)    
    credits = Column(Integer, nullable=False)  