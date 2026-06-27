from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.chat import router as chat_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.materials import router as materials_router
from app.api.v1.endpoints.predict import router as predict_router
from app.api.v1.endpoints.quizzes import router as quizzes_router
from app.api.v1.endpoints.attempts import router as attempts_router

api_router = APIRouter()

# Register core application pipelines
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat_router, prefix="/chat", tags=["AI Tutor Core"])
api_router.include_router(materials_router, prefix="/materials", tags=["Study Material Management"])
api_router.include_router(profile_router, prefix="/profile", tags=["Student Analytics Profile"])
api_router.include_router(predict_router, prefix="/predict", tags=["Predictive ML Model Engine"])
api_router.include_router(quizzes_router, prefix="/quizzes", tags=["Quizzes"])
api_router.include_router(attempts_router, prefix="/attempts", tags=["Attempts"])