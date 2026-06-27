# backend/app/schemas/quiz.py
from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Literal
from datetime import datetime

class LLMQuestionFormat(BaseModel):
    """Strict structural format requested directly from the LLM provider."""
    question_text: str = Field(description="The clear question prompt.")
    
    question_type: Literal["MCQ", "SHORT_ANSWER", "LONG_ANSWER"] = Field(description="Enforced question type.")
    options: Optional[List[str]] = Field(default=None, description="Must contain exactly 4 choices if MCQ.")
    correct_answer: str = Field(description="The exact text of the correct answer or comprehensive reference criteria.")
    difficulty: Literal["easy", "medium", "hard"] = Field(description="The targeted difficulty rating.")
    topic: str = Field(description="The matching conceptual category dynamically determined from text.")
    source_excerpt: Optional[str] = Field(default=None, description="Exact quote copied from the source text.")

    @model_validator(mode="after")
    def validate_question_dependencies(self) -> "LLMQuestionFormat":
        if self.question_type == "MCQ":
            if not self.options or len(self.options) != 4:
                raise ValueError("MCQ questions must contain exactly 4 choices in the options list.")
        # 🌟 FIXED: Short answer and Long answer fields both require null options structures
        elif self.question_type in ["SHORT_ANSWER", "LONG_ANSWER"]:
            if self.options is not None:
                raise ValueError(f"{self.question_type} questions must have a completely null options field.")
        return self

class LLMQuizPayloadFormat(BaseModel):
    quiz_title: str = Field(description="Descriptive name generated for the quiz.")
    questions: List[LLMQuestionFormat]

class QuizGenerationRequest(BaseModel):
    material_id: int
    num_questions: int = Field(default=5, ge=1, le=20)
    target_difficulty: Literal["easy", "medium", "hard"] = Field(default="medium")

class QuestionInternalResponse(BaseModel):
    id: int
    quiz_id: int
    question_text: str
    question_type: str
    options: Optional[List[str]] = None
    correct_answer: str
    difficulty: str
    topic: Optional[str] = None
    source_excerpt: Optional[str] = None

    model_config = {"from_attributes": True}

class QuizDetailResponse(BaseModel):
    id: int
    material_id: int
    title: str
    created_at: datetime

    questions: List[QuestionInternalResponse]

    model_config = {"from_attributes": True}