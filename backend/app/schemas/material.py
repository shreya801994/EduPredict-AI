# backend/app/schemas/material.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class StudyMaterialBase(BaseModel):
    title: str

class StudyMaterialCreate(StudyMaterialBase):
    pass

class StudyMaterialResponse(StudyMaterialBase):
    id: int
    student_id: int
    file_path: str
    extracted_text: Optional[str] = None
    uploaded_at: datetime

    # Configures Pydantic to read ORM attributes seamlessly from SQLAlchemy instances
    model_config = ConfigDict(from_attributes=True)