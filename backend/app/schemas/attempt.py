# backend/app/schemas/attempt.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AnswerSubmission(BaseModel):
    """Validates individual itemized question answer inputs."""
    question_id: int = Field(..., description="The unique database ID of the target question")
    selected_option: Optional[str] = Field(None, description="The string choice (e.g. 'A') if MCQ")
    provided_text: Optional[str] = Field(None, description="The written text string if short/long answer")

class QuizSubmissionRequest(BaseModel):
    """Validates the overall incoming multi-question quiz submission array."""
    quiz_id: int = Field(..., description="The ID of the quiz being attempted")
    student_id: int = Field(..., description="The ID of the student submitting the quiz")
    answers: List[AnswerSubmission] = Field(..., description="The itemized array of student responses")

class AnswerResponse(BaseModel):
    """Serialized format for returning evaluated results back to the user interface."""
    id: int
    question_id: int
    selected_option: Optional[str]
    provided_text: Optional[str]
    is_correct: bool
    ai_feedback: Optional[str]
    question_difficulty: str
    grading_score: float

    # FIXED: Pydantic v2 style consistency
    model_config = {"from_attributes": True}

class QuizAttemptResponse(BaseModel):
    """The final metadata payload returned upon successful computation."""
    attempt_id: int
    quiz_id: int
    student_id: int
    score: float
    started_at: datetime
    completed_at: Optional[datetime]
    answers: List[AnswerResponse]

    model_config = {"from_attributes": True}

class StudentAttemptHistoryItem(BaseModel):
        """Lightweight summary format for dashboard feeds."""
        attempt_id: int
        quiz_id: int
        score: float
        completed_at: Optional[datetime]

        model_config = {"from_attributes": True}


class AttemptDetailResponse(BaseModel):
    """Detailed structural format for reviewing an old exam submission."""
    attempt_id: int
    quiz_id: int
    student_id: int
    score: float
    started_at: datetime
    completed_at: Optional[datetime]
    answers: List[AnswerResponse]

    model_config = {"from_attributes": True}


class StudentAnalyticsResponse(BaseModel):
    """The analytical summary wrapper for a student's performance ledger."""
    total_attempts: int
    average_score: float
    best_score: float
    worst_score: float

    model_config = {"from_attributes": True}

class TopicMasteryItem(BaseModel):
    """Detailed mastery metrics per parsed learning topic."""
    topic: str
    mastery_percentage: float
    total_questions_answered: int

class WeakAreaItem(BaseModel):
    """Actionable warning indicators for topics failing the target mastery threshold."""
    topic: str
    mastery_percentage: float

class StudentTopicAnalyticsResponse(BaseModel):
    """Comprehensive diagnostic overview for dashboard progress screens."""
    student_id: int
    topic_mastery: List[TopicMasteryItem]
    weak_areas: List[WeakAreaItem]

    model_config = {"from_attributes": True}

class RecommendedMaterialItem(BaseModel):
    material_id: int
    title: str
    relevance_reason: str

class TopicRecommendationItem(BaseModel):
    topic: str
    mastery_percentage: float
    recommended_materials: List[RecommendedMaterialItem]

class StudentRemediationResponse(BaseModel):
    student_id: int
    remedial_roadmap: List[TopicRecommendationItem]

    model_config = {"from_attributes": True}