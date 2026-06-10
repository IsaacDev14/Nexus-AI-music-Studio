import os
import subprocess
import tempfile
from pathlib import Path

VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".webm"}


def is_video(filename: str) -> bool:
    return Path(filename).suffix.lower() in VIDEO_EXTENSIONS


def is_audio(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in AUDIO_EXTENSIONS or ext in VIDEO_EXTENSIONS


def extract_audio_from_video(video_path: str, output_path: str) -> str:
    """Extract mono 22050 Hz WAV from video using ffmpeg."""
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le",
        "-ar", "22050", "-ac", "1",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr[-500:]}")
    return output_path


def prepare_audio_file(upload_path: str, original_filename: str) -> tuple[str, bool]:
    """
    Returns (wav_path, should_cleanup).
    If input is already wav/flac suitable for librosa, may return as-is.
    """
    ext = Path(original_filename).suffix.lower()

    if ext in {".wav", ".flac"}:
        return upload_path, False

    if is_video(original_filename) or ext in {".mp3", ".m4a", ".aac", ".ogg", ".webm", ".mp4", ".mov", ".mkv"}:
        out = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        out.close()
        if is_video(original_filename):
            extract_audio_from_video(upload_path, out.name)
        else:
            cmd = [
                "ffmpeg", "-y", "-i", upload_path,
                "-acodec", "pcm_s16le", "-ar", "22050", "-ac", "1",
                out.name,
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                os.unlink(out.name)
                raise RuntimeError(f"Audio conversion failed: {result.stderr[-500:]}")
        return out.name, True

    return upload_path, False
