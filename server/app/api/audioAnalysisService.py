"""Audio analysis: BPM, key, and basic chord progression detection."""
import numpy as np

KEY_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

CHORD_TEMPLATES: dict[str, np.ndarray] = {}
for i, root in enumerate(KEY_NAMES):
    major = np.zeros(12)
    major[i] = 1
    major[(i + 4) % 12] = 1
    major[(i + 7) % 12] = 1
    CHORD_TEMPLATES[root] = major

    minor = np.zeros(12)
    minor[i] = 1
    minor[(i + 3) % 12] = 1
    minor[(i + 7) % 12] = 1
    CHORD_TEMPLATES[f"{root}m"] = minor


def _detect_key(chroma_mean: np.ndarray) -> tuple[str, str, float]:
    best_key = "C"
    best_mode = "major"
    best_corr = -1.0

    for shift in range(12):
        rolled = np.roll(chroma_mean, -shift)
        major_corr = np.corrcoef(rolled, MAJOR_PROFILE)[0, 1]
        minor_corr = np.corrcoef(rolled, MINOR_PROFILE)[0, 1]

        if not np.isnan(major_corr) and major_corr > best_corr:
            best_corr = major_corr
            best_key = KEY_NAMES[shift]
            best_mode = "major"
        if not np.isnan(minor_corr) and minor_corr > best_corr:
            best_corr = minor_corr
            best_key = KEY_NAMES[shift]
            best_mode = "minor"

    label = f"{best_key} {'Major' if best_mode == 'major' else 'Minor'}"
    confidence = float(max(0, min(1, best_corr)))
    return label, best_mode, confidence


def _match_chord(chroma_vec: np.ndarray) -> tuple[str, float]:
    best_chord = "N"
    best_score = -1.0
    norm = np.linalg.norm(chroma_vec)
    if norm < 1e-6:
        return "N", 0.0
    chroma_norm = chroma_vec / norm

    for name, template in CHORD_TEMPLATES.items():
        t_norm = template / (np.linalg.norm(template) + 1e-8)
        score = float(np.dot(chroma_norm, t_norm))
        if score > best_score:
            best_score = score
            best_chord = name

    return best_chord, best_score


def _detect_chords(y, sr, beats: np.ndarray) -> list[dict]:
    import librosa

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    beat_frames = librosa.time_to_frames(beats, sr=sr)
    beat_frames = np.unique(beat_frames)
    if len(beat_frames) < 2:
        return []

    progression = []
    for i in range(len(beat_frames) - 1):
        start = beat_frames[i]
        end = beat_frames[i + 1]
        segment = np.mean(chroma[:, start:end], axis=1)
        chord, confidence = _match_chord(segment)
        time_sec = float(librosa.frames_to_time(start, sr=sr))
        if chord != "N" and confidence > 0.5:
            progression.append({
                "chord": chord,
                "time": round(time_sec, 2),
                "confidence": round(confidence, 2),
            })

    # Deduplicate consecutive same chords
    deduped = []
    for item in progression:
        if not deduped or deduped[-1]["chord"] != item["chord"]:
            deduped.append(item)

    return deduped[:32]


def analyze_audio_file(file_path: str) -> dict:
    import librosa

    y, sr = librosa.load(file_path, sr=22050, mono=True, duration=180)

    if len(y) < sr:
        raise ValueError("Audio too short to analyze (minimum 1 second)")

    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    bpm = float(tempo) if np.isscalar(tempo) else float(tempo[0])

    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    key_label, mode, key_confidence = _detect_key(chroma_mean)

    chords = _detect_chords(y, sr, beat_times)

    duration_sec = float(len(y) / sr)

    return {
        "bpm": round(bpm, 1),
        "key": key_label,
        "mode": mode,
        "keyConfidence": round(key_confidence, 2),
        "durationSeconds": round(duration_sec, 1),
        "chordProgression": chords,
        "chordSummary": [c["chord"] for c in chords],
    }
