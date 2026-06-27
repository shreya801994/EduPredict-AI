from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from app.db.session import get_db
from app.schemas.profile import StudentDataSubmission
from app.models.profile import StudentProfile
from app.models.scores import SubjectScore
from app.models.user import User

router = APIRouter()
security = HTTPBearer()


@router.post("/submit")
def submit_student_metrics(
    payload: StudentDataSubmission,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload_data = jwt.decode(
            token,
            options={"verify_signature": False}
        )

        user_email = payload_data.get("sub")

        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing identifier data"
            )

    except Exception as token_err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token parsing failed: {str(token_err)}"
        )

    user_record = (
        db.query(User)
        .filter(User.email == user_email)
        .first()
    )

    if not user_record:
        raise HTTPException(
            status_code=404,
            detail="Authenticated user account not found."
        )

    student_id = user_record.id

    try:

        existing_profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.student_id == student_id)
            .first()
        )

        if existing_profile:

            existing_profile.age = payload.profile.age
            existing_profile.gender = payload.profile.gender
            existing_profile.attendance = payload.profile.attendance
            existing_profile.study_hours = payload.profile.study_hours
            existing_profile.sleep_hours = payload.profile.sleep_hours
            existing_profile.family_support = payload.profile.family_support
            existing_profile.internet_access = payload.profile.internet_access

        else:

            new_profile = StudentProfile(
                student_id=student_id,
                age=payload.profile.age,
                gender=payload.profile.gender,
                attendance=payload.profile.attendance,
                study_hours=payload.profile.study_hours,
                sleep_hours=payload.profile.sleep_hours,
                family_support=payload.profile.family_support,
                internet_access=payload.profile.internet_access
            )

            db.add(new_profile)

        db.query(SubjectScore).filter(
            SubjectScore.student_id == student_id
        ).delete()

        for subject_data in payload.scores:

            db.add(
                SubjectScore(
                    student_id=student_id,
                    subject=subject_data.subject,
                    grade=subject_data.grade,
                    credits=subject_data.credits
                )
            )

        db.commit()

        return {
            "status": "success",
            "message": "Student profile data successfully compiled and saved."
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database pipeline failure: {str(e)}"
        )


@router.get("/me")
def get_student_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            options={"verify_signature": False}
        )

        user_email = payload.get("sub")

        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token."
            )

    except Exception as e:

        raise HTTPException(
            status_code=401,
            detail=str(e)
        )

    user = (
        db.query(User)
        .filter(User.email == user_email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.student_id == user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found."
        )

    return {
        "age": profile.age,
        "gender": profile.gender,
        "attendance": profile.attendance,
        "study_hours": profile.study_hours,
        "sleep_hours": profile.sleep_hours,
        "family_support": profile.family_support,
        "internet_access": profile.internet_access
    }