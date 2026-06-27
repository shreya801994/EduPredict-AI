# backend/app/api/v1/endpoints/materials.py
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.material import StudyMaterial
from app.schemas.material import StudyMaterialResponse
from app.services.pdf_extractor import extract_text_from_pdf

router = APIRouter()

# 🧭 CALCULATE ABSOLUTE ENVIRONMENT PATHS 
# Move up 3 layers from: backend/app/api/v1/endpoints/materials.py -> backend/app/
BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "uploads" / "materials"

@router.post("/upload", response_model=StudyMaterialResponse, status_code=status.HTTP_201_CREATED)
def upload_study_material(
    student_id: int = Form(..., description="The foreign key ID of the testing student user account"),
    title: str = Form(..., description="Descriptive naming variant for the study tracking artifact"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Defensively validate file extensions before writing blocks to disk
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file payload. Only target PDF files are supported by the extraction service."
        )

    # 2. Assert storage folder target structures exist on runtime host machine
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # 3. Generate a non-colliding randomized absolute destination path
    unique_filename = f"{os.urandom(8).hex()}_{file.filename}"
    saved_file_path = UPLOAD_DIR / unique_filename

    try:
        # Stream the binary data safely onto the persistent disk layer
        with saved_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as io_error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Disk I/O pipeline fault while registering file: {str(io_error)}"
        )

    # 4. Invoke the decoupled text processing service layer
    final_text = extract_text_from_pdf(saved_file_path)

    # 5. Build record and commit to Supabase using the form parameter ID
    db_material = StudyMaterial(
        student_id=student_id,
        title=title,
        file_path=str(saved_file_path),
        extracted_text=final_text
    )

    try:
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
    except Exception as db_err:
        db.rollback()
        # Clean up files if database transactions fail to avoid orphaned files on disk
        if saved_file_path.exists():
            saved_file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Supabase tracking log record failed. Transaction aborted: {str(db_err)}"
        )

    return db_material