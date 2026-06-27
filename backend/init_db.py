import sys
import os
from sqlalchemy import text, inspect
from app.models.quiz import Quiz, QuizQuestion

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, Base, SessionLocal
from app.models.user import User

# CRITICAL RE-ENGINEERING IMPORTS: Ensure SQLAlchemy registers these targets
try:
    from app.models.attempt import StudentQuizAttempt, StudentAnswer
    print("✅ Attempt tracking models imported successfully.")
except ImportError as err:
    print(f"❌ Could not import attempt models: {err}")

try:
    from app.models.scores import SubjectScore
except ImportError:
    print("⚠️ Could not import SubjectScore from app.models.scores.")

try:
    from app.models.history import PredictionHistory
    print("✅ PredictionHistory model imported successfully.")
except ImportError:
    print("❌ Critical: Could not import PredictionHistory from app.models.history. Check file path!")

try:
    from app.models.material import StudyMaterial
    print("✅ StudyMaterial model imported successfully.")
except ImportError:
    print("❌ Critical: Could not import StudyMaterial from app.models.material. Check file path!")

def init_database():
    print("🔄 Connecting directly to Supabase Mumbai cluster...")
    
    # This will now look at User, SubjectScore, PredictionHistory, AND StudyMaterial and create whatever is missing
    Base.metadata.create_all(bind=engine)
    print("✅ Core meta-tables initialized.")
    
    # 📡 LIVE SUPABASE SCHEMA AUDIT 
    print("\n" + "="*40)
    print(" 📡 LIVE SUPABASE SCHEMA AUDIT ")
    print("="*40)

    inspector = inspect(engine)
    live_tables = inspector.get_table_names()

    for table in live_tables:
        print(f"  🔹 {table}")

    print("="*40 + "\n")
    
    db = SessionLocal()
    try:
        print("Executing structural patch parameters directly on table 'subject_scores'...")
        
        # 1. Attach grade column if it's missing
        try:
            db.execute(text("ALTER TABLE subject_scores ADD COLUMN grade VARCHAR NOT NULL DEFAULT 'A';"))
            db.commit()
            print("✅ 'grade' column successfully attached.")
        except Exception as col_err:
            db.rollback()

        # 2. Attach credits column if it's missing
        try:
            db.execute(text("ALTER TABLE subject_scores ADD COLUMN credits INTEGER NOT NULL DEFAULT 3;"))
            db.commit()
            print("✅ 'credits' column successfully attached.")
        except Exception as col_err:
            db.rollback()

        # 3. Drop the strict NOT NULL constraint on the old 'score' column
        try:
            print("Removing strict constraint on old 'score' column...")
            db.execute(text("ALTER TABLE subject_scores ALTER COLUMN score DROP NOT NULL;"))
            db.commit()
            print("✅ Fixed! Old 'score' constraint removed. It will no longer block calculations.")
        except Exception as score_err:
            db.rollback()
            print(f"ℹ️ Could not alter old column constraint: {score_err}")
            
        print(" DATABASE ARCHITECTURE SYNC COMPLETE!")
    except Exception as e:
        db.rollback()
        print(f"❌ Structural alteration completely failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()