# backend/app/api/v1/endpoints/quizzes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# 🛡️ 1. Reusing your project's single source of truth for the database dependency
from app.db.session import get_db 
from app.models.quiz import Quiz
from app.schemas.quiz import QuizGenerationRequest
from app.schemas.quiz import QuizDetailResponse

from app.services.quiz_generator import QuizGeneratorService

router = APIRouter()

@router.post(
    "/generate", 
    status_code=status.HTTP_201_CREATED,
    summary="Generate a new mixed AI quiz from uploaded study material"
)
def generate_new_quiz(request_dto: QuizGenerationRequest, db: Session = Depends(get_db)):
    """
    Triggers the AI pipeline to analyze text from a specific document ID,
    assembles a varied mix of MCQ, SHORT_ANSWER, and LONG_ANSWER questions,
    commits them atomically to Supabase, and returns metadata confirmation.
    """
    try:
        new_quiz = QuizGeneratorService.generate_quiz_from_material(db, request_dto)
        return {
            "status": "success",
            "quiz_id": new_quiz.id,
            "title": new_quiz.title,
            "material_id": new_quiz.material_id,
            "created_at": new_quiz.created_at,
            "question_count": len(new_quiz.questions)
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected failure occurred during quiz generation: {str(err)}"
        )

@router.get(
    "/{quiz_id}",
    response_model=QuizDetailResponse,
    summary="Get a specific quiz instance by its primary key ID"
)
def get_quiz_by_id(
    quiz_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetches a previously generated quiz metadata block by its table ID.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz record matching ID {quiz_id} could not be found."
        )
    return quiz