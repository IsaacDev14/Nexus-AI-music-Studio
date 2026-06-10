# server/app/routers/ai.py
from fastapi import APIRouter, HTTPException
from app.api.grokService import grok_service
from app.api.geminiService import gemini_music_service
from app.api.response_normalizers import (
    normalize_rhythm,
    normalize_melody,
    normalize_improv,
    normalize_lyrics,
    normalize_practice_advice,
    normalize_lesson,
    normalize_song_arrangement,
)
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
    AIStatusResult,
)

router = APIRouter(prefix="/ai")


async def _try_ai_providers(gemini_func, grok_func, *args):
    if gemini_music_service.available:
        try:
            print("Trying Gemini...")
            return await gemini_func(*args)
        except Exception as ge:
            print(f"Gemini failed: {ge}")

    if grok_service.available:
        print("Switching to Grok...")
        try:
            return await grok_func(*args)
        except Exception as e:
            print(f"Grok also failed: {e}")
            raise HTTPException(status_code=503, detail=str(e))

    raise HTTPException(status_code=503, detail="All AI systems are currently unavailable")


@router.get("/status", response_model=AIStatusResult)
async def ai_status():
    gemini = gemini_music_service.available
    grok = grok_service.available
    if gemini or grok:
        status = "online"
    else:
        status = "offline"
    return AIStatusResult(gemini_available=gemini, grok_available=grok, status=status)


@router.post("/chords", response_model=FullSongArrangement)
async def generate_song_arrangement(request: ChordProgressionRequest):
    async def gemini_call(req):
        result = await gemini_music_service.generateSongArrangement(req)
        return normalize_song_arrangement(result)

    async def grok_call(req):
        result = await grok_service.generate_song_arrangement(req)
        return normalize_song_arrangement(result)

    return await _try_ai_providers(gemini_call, grok_call, request)


@router.post("/backing-track", response_model=BackingTrackResult)
async def generate_backing_track(data: dict):
    prompt = data["prompt"]

    async def gemini_call(p):
        return await gemini_music_service.generate_backing_track(p)

    return await _try_ai_providers(
        gemini_call,
        grok_service.generate_backing_track,
        prompt
    )


@router.post("/rhythm", response_model=RhythmPatternResult)
async def generate_rhythm(data: dict):
    time_sig = data["timeSignature"]
    level = data["level"]

    async def gemini_call(ts, lvl):
        result = await gemini_music_service.generate_rhythm_pattern(ts, lvl)
        return normalize_rhythm(result, ts, lvl)

    async def grok_call(ts, lvl):
        result = await grok_service.generate_rhythm_pattern(ts, lvl)
        return normalize_rhythm(result, ts, lvl)

    normalized = await _try_ai_providers(gemini_call, grok_call, time_sig, level)
    return RhythmPatternResult(**normalized)


@router.post("/melody", response_model=MelodySuggestionResult)
async def generate_melody(data: dict):
    key = data["key"]
    style = data["style"]

    async def gemini_call(k, s):
        result = await gemini_music_service.generate_melody(k, s)
        return normalize_melody(result, k, s)

    async def grok_call(k, s):
        result = await grok_service.generate_melody(k, s)
        return normalize_melody(result, k, s)

    normalized = await _try_ai_providers(gemini_call, grok_call, key, style)
    return MelodySuggestionResult(**normalized)


@router.post("/improv", response_model=ImprovTipsResult)
async def get_improv_tips(data: dict):
    query = data["query"]

    async def gemini_call(q):
        result = await gemini_music_service.generate_improv_tips(q)
        return normalize_improv(result, q)

    async def grok_call(q):
        result = await grok_service.generate_improv_tips(q)
        return normalize_improv(result, q)

    normalized = await _try_ai_providers(gemini_call, grok_call, query)
    return ImprovTipsResult(**normalized)


@router.post("/lyrics", response_model=LyricsResult)
async def generate_lyrics(data: dict):
    topic = data["topic"]
    genre = data["genre"]
    mood = data["mood"]

    async def gemini_call(t, g, m):
        result = await gemini_music_service.generate_lyrics(t, g, m)
        return normalize_lyrics(result)

    async def grok_call(t, g, m):
        result = await grok_service.generate_lyrics(t, g, m)
        return normalize_lyrics(result)

    normalized = await _try_ai_providers(gemini_call, grok_call, topic, genre, mood)
    return LyricsResult(**normalized)


@router.post("/practice-advice", response_model=PracticeAdviceResult)
async def get_practice_advice(data: dict):
    sessions = data["sessions"]

    async def gemini_call(s):
        result = await gemini_music_service.get_practice_advice(s)
        return normalize_practice_advice(result)

    async def grok_call(s):
        result = await grok_service.get_practice_advice(s)
        return normalize_practice_advice(result)

    normalized = await _try_ai_providers(gemini_call, grok_call, sessions)
    return PracticeAdviceResult(**normalized)


@router.post("/lesson", response_model=LessonResult)
async def generate_lesson(data: dict):
    skill = data["skill_level"]
    instrument = data["instrument"]
    focus = data["focus"]

    async def gemini_call(sk, inst, f):
        result = await gemini_music_service.generate_lesson(sk, inst, f)
        return normalize_lesson(result)

    async def grok_call(sk, inst, f):
        result = await grok_service.generate_lesson(sk, inst, f)
        return normalize_lesson(result)

    normalized = await _try_ai_providers(gemini_call, grok_call, skill, instrument, focus)
    return LessonResult(**normalized)
