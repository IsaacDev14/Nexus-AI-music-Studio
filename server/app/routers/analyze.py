import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.api.mediaExtract import is_audio, prepare_audio_file
from app.api.audioAnalysisService import analyze_audio_file
from app.api.auddService import audd_service
from app.api.grokService import grok_service
from app.api.geminiService import gemini_music_service
from app.api.response_normalizers import normalize_song_arrangement
from app.schemas import AudioAnalysisResult, ChordProgressionRequest

router = APIRouter(prefix="/analyze")

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=AudioAnalysisResult)
async def analyze_upload(file: UploadFile = File(...)):
    if not file.filename or not is_audio(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file. Upload mp3, wav, m4a, ogg, flac, or video (mp4, mov, webm).",
        )

    suffix = os.path.splitext(file.filename)[1] or ".tmp"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    cleanup_paths = [tmp.name]

    try:
        content = await file.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File too large (max 50 MB).")
        tmp.write(content)
        tmp.close()

        wav_path, extra_cleanup = prepare_audio_file(tmp.name, file.filename)
        if extra_cleanup:
            cleanup_paths.append(wav_path)

        analysis = analyze_audio_file(wav_path)
        song_info = await audd_service.identify_from_file(wav_path)

        ai_chords = None
        if song_info:
            query = f"{song_info['title']} by {song_info['artist']}"
            try:
                req = ChordProgressionRequest(songQuery=query, simplify=False)
                if gemini_music_service.available:
                    raw = await gemini_music_service.generateSongArrangement(req)
                elif grok_service.available:
                    raw = await grok_service.generate_song_arrangement(req)
                else:
                    raw = None
                if raw:
                    ai_chords = normalize_song_arrangement(raw)
            except Exception as e:
                print(f"AI chord lookup after AudD failed: {e}")

        return AudioAnalysisResult(
            filename=file.filename,
            bpm=analysis["bpm"],
            key=analysis["key"],
            mode=analysis["mode"],
            keyConfidence=analysis["keyConfidence"],
            durationSeconds=analysis["durationSeconds"],
            detectedChords=analysis["chordProgression"],
            chordSummary=analysis["chordSummary"],
            songTitle=song_info.get("title") if song_info else None,
            songArtist=song_info.get("artist") if song_info else None,
            songAlbum=song_info.get("album") if song_info else None,
            auddMatched=song_info is not None,
            aiArrangement=ai_chords,
        )
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        for path in cleanup_paths:
            try:
                os.unlink(path)
            except OSError:
                pass
