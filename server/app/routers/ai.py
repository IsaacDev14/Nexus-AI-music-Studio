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

router = APIRouter(prefix="/ai")


async def _try_gemini_first(gemini_func, grok_func, *args):
    if gemini_music_service.available:
        try:
            print("→ Trying Gemini...")
            return await gemini_func(*args)
        except Exception as ge:
            print(f"⚠ Gemini failed: {ge}")

    print("→ Switching to Grok...")
    try:
        return await grok_func(*args)
    except Exception as e:
        print(f"❌ Grok also failed: {e}")
        raise HTTPException(status_code=503, detail="All AI systems are currently unavailable")


# ---------------- ROUTES ---------------- #

@router.post("/chords", response_model=FullSongArrangement)
async def generate_song_arrangement(request: ChordProgressionRequest):
    async def gemini_call(req):
        return await gemini_music_service.generateSongArrangement(req)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_song_arrangement,
        request
    )


@router.post("/backing-track", response_model=BackingTrackResult)
async def generate_backing_track(data: dict):
    prompt = data["prompt"]

    async def gemini_call(p):
        return await gemini_music_service.generate_backing_track(p)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_backing_track,
        prompt
    )


@router.post("/rhythm", response_model=RhythmPatternResult)
async def generate_rhythm(data: dict):
    time_sig = data["timeSignature"]
    level = data["level"]

    async def gemini_call(ts, lvl):
        return await gemini_music_service.generate_rhythm_pattern(ts, lvl)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_rhythm_pattern,
        time_sig, level
    )


@router.post("/melody", response_model=MelodySuggestionResult)
async def generate_melody(data: dict):
    key = data["key"]
    style = data["style"]

    async def gemini_call(k, s):
        result = await gemini_music_service.generate_melody(k, s)
        return MelodySuggestionResult(**result)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_melody,
        key, style
    )


@router.post("/improv", response_model=ImprovTipsResult)
async def get_improv_tips(data: dict):
    query = data["query"]

    async def gemini_call(q):
        result = await gemini_music_service.generate_improv_tips(q)
        return ImprovTipsResult(**result)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_improv_tips,
        query
    )


@router.post("/lyrics", response_model=LyricsResult)
async def generate_lyrics(data: dict):
    topic = data["topic"]
    genre = data["genre"]
    mood = data["mood"]

    async def gemini_call(t, g, m):
        result = await gemini_music_service.generate_lyrics(t, g, m)
        return LyricsResult(**result)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_lyrics,
        topic, genre, mood
    )


@router.post("/practice-advice", response_model=PracticeAdviceResult)
async def get_practice_advice(data: dict):
    sessions = data["sessions"]

    async def gemini_call(s):
        result = await gemini_music_service.get_practice_advice(s)
        return PracticeAdviceResult(**result)

    return await _try_gemini_first(
        gemini_call,
        grok_service.get_practice_advice,
        sessions
    )


@router.post("/lesson", response_model=LessonResult)
async def generate_lesson(data: dict):
    skill = data["skill_level"]
    instrument = data["instrument"]
    focus = data["focus"]

    async def gemini_call(sk, inst, f):
        result = await gemini_music_service.generate_lesson(sk, inst, f)
        return LessonResult(**result)

    return await _try_gemini_first(
        gemini_call,
        grok_service.generate_lesson,
        skill, instrument, focus
    )
