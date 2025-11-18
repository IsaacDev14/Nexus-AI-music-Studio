from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Song

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# List all songs
@router.get("/")
def list_songs(db: Session = Depends(get_db)):
    return db.query(Song).all()

# Create song
@router.post("/")
def create_song(title: str, artist: str = None, genre: str = None, db: Session = Depends(get_db)):
    song = Song(title=title, artist=artist, genre=genre)
    db.add(song)
    db.commit()
    db.refresh(song)
    return song
