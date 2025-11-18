from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all users
@router.get("/")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Create user
@router.post("/")
def create_user(name: str, email: str, skill_level: str = None, db: Session = Depends(get_db)):
    user = User(name=name, email=email, skill_level=skill_level, password="changeme")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
