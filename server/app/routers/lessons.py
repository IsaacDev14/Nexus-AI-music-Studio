from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Lesson

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# List all lessons
@router.get("/")
def list_lessons(db: Session = Depends(get_db)):
    return db.query(Lesson).all()

# Create lesson
@router.post("/")
def create_lesson(title: str, lesson_type: str, instrument_id: int, difficulty: str = None, content: str = None, db: Session = Depends(get_db)):
    lesson = Lesson(title=title, lesson_type=lesson_type, instrument_id=instrument_id, difficulty=difficulty, content=content)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson
