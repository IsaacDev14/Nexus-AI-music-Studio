from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Instrument

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# List all instruments
@router.get("/")
def list_instruments(db: Session = Depends(get_db)):
    return db.query(Instrument).all()

# Create instrument
@router.post("/")
def create_instrument(name: str, type: str = None, db: Session = Depends(get_db)):
    instrument = Instrument(name=name, type=type)
    db.add(instrument)
    db.commit()
    db.refresh(instrument)
    return instrument
