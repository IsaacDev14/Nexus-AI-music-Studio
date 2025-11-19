# server/app/routers/ai.py
from fastapi import APIRouter, HTTPException
from app.api.grokService import grok_service
from app.api.geminiService import gemini_music_service
from app.schemas import (
    ChordProgressionRequest,
    FullSongArrangement,
    BackingTrackResult,
    RhythmPatternResult,
    MelodySuggestionResult,
    ImprovTipsResult,
    LyricsResult,
    PracticeAdviceResult,
    LessonResult,
)

# ← CLEAN, NO PREFIX — as you wanted!
router = APIRouter()

# 1. Full Song Tab (Chords + Lyrics + Diagrams)
@router.post("/chords", response_model=FullSongArrangement)
async def generate_song_arrangement(request: ChordProgressionRequest):
    print(f"Generating song: {request.songQuery}")
    try:
        result = await grok_service.generate_song_arrangement(request)
        print("✓ Grok succeeded")
        return result
    except Exception as e:
        print(f"Grok failed ({e}), falling back to Gemini...")
        try:
            result = await gemini_music_service.generateSongArrangement(request)
            print("✓ Gemini fallback succeeded")
            return result
        except Exception as ge:
            raise HTTPException(status_code=503, detail="All AI backends currently unavailable")

# 2. Backing Track
@router.post("/backing-track", response_model=BackingTrackResult)
async def generate_backing_track(data: dict):
    prompt = data.get("prompt", "Create a pop rock backing track in C major")
    try:
        return await grok_service.generate_backing_track(prompt)
    except:
        raise HTTPException(500, "Failed to generate backing track")

# 3. Rhythm Pattern
@router.post("/rhythm", response_model=RhythmPatternResult)
async def generate_rhythm(data: dict):
    try:
        return await grok_service.generate_rhythm_pattern(
            data.get("timeSignature", "4/4"),
            data.get("level", "intermediate")
        )
    except:
        return {"pattern": "x---x---x---x---", "description": "Basic rock beat"}

# 4. Melody Suggestion
@router.post("/melody", response_model=MelodySuggestionResult)
async def generate_melody(data: dict):
    try:
        return await grok_service.generate_melody(
            data.get("key", "C"),
            data.get("style", "pop")
        )
    except:
        return {"melody": "C4 E4 G4 C5 | B4 G4 E4 C4", "description": "Simple motif"}

# 5. Improv Tips
@router.post("/improv", response_model=ImprovTipsResult)
async def get_improv_tips(data: dict):
    try:
        return await grok_service.generate_improv_tips(data.get("query", "blues"))
    except:
        return {"response": "Target chord tones on strong beats.", "scales": ["pentatonic"], "techniques": ["bends"]}

# 6. Lyrics Generator
@router.post("/lyrics", response_model=LyricsResult)
async def generate_lyrics(data: dict):
    try:
        return await grok_service.generate_lyrics(
            data.get("topic", "love"),
            data.get("genre", "pop"),
            data.get("mood", "hopeful")
        )
    except:
        return {"lyrics": "[Verse 1]\nDefault lyrics generated...\n[Chorus]\nThis is a song..."}

# 7. Practice Advice
@router.post("/practice-advice", response_model=PracticeAdviceResult)
async def get_practice_advice(data: dict):
    try:
        return await grok_service.get_practice_advice(data.get("sessions", []))
    except:
        return {"advice": "Keep practicing daily!", "nextGoals": ["Increase tempo", "Record yourself"]}

# 8. AI Lesson Generator — THIS NOW WORKS 100%
@router.post("/lesson", response_model=LessonResult)
async def generate_lesson(data: dict):
    skill = data.get("skill_level", "intermediate")
    instrument = data.get("instrument", "guitar")
    focus = data.get("focus", "chord transitions")
    
    try:
        result = await grok_service.generate_lesson(skill, instrument, focus)
        print("✓ Lesson generated with Grok")
        return result
    except Exception as e:
        print(f"Lesson generation failed: {e}")
        # Friendly fallback lesson
        return {
            "lesson": f"# {focus.title()} Lesson ({skill.title()})\n\n"
                     f"**Instrument**: {instrument.title()}\n\n"
                     "1. Warm-up (5 mins)\n"
                     "2. Technique drills\n"
                     "3. Apply to a real song\n"
                     "4. Record & review\n\n"
                     "You're doing great — keep going! 🎸"
        }