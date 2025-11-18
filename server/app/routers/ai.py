from fastapi import APIRouter, UploadFile, File, HTTPException
from app.routers import geminiService, auddService

router = APIRouter()

# Generate chord progression
@router.post("/chord")
async def generate_chord(song_query: str, simplify: bool = True, help_practice: bool = False, show_substitutions: bool = False):
    from app.models import ChordProgressionRequest
    request = ChordProgressionRequest(
        songQuery=song_query,
        simplify=simplify,
        helpPractice=help_practice,
        showSubstitutions=show_substitutions
    )
    try:
        result = await geminiService.generateChordProgression(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Recognize song from audio
@router.post("/recognize")
async def recognize_song(file: UploadFile = File(...)):
    try:
        audio_data = await file.read()
        result = await auddService.recognizeSong(audio_data)
        if result:
            return result
        return {"message": "No song recognized"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
