from pydantic import BaseModel, Field
from typing import List

class SubjectScoreSchema(BaseModel):
    subject: str
    grade: str = Field(..., description="Letter grade like A+, A, B")
    credits: int = Field(..., ge=1, le=5)

class ProfileDataSchema(BaseModel):
    age: int
    gender: str
    attendance: float
    study_hours: float
    sleep_hours: float
    family_support: str
    internet_access: str

class StudentDataSubmission(BaseModel):
    profile: ProfileDataSchema
    scores: List[SubjectScoreSchema]