# server/app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Union, Literal, Any

# --- Tablature ---
class TabLine(BaseModel):
    lyrics: str
    isChordLine: bool

class TabSection(BaseModel):
    section: str
    lines: List[TabLine]

# --- Chord Diagrams ---
FretValue = Union[int, Literal["X"]]

class ChordDiagram(BaseModel):
    chord: str
    frets: List[FretValue]
    fingers: List[Optional[int]]
    capoFret: int = 0

# --- Core ---
class Substitution(BaseModel):
    originalChord: str
    substitutedChord: str
    theory: str

class ChordProgressionRequest(BaseModel):
    songQuery: str
    simplify: bool = True
    helpPractice: bool = True
    showSubstitutions: bool = True
    instrument: Literal["Guitar", "Ukulele", "Piano"] = "Guitar"
    key: Optional[str] = None
    artist: Optional[str] = None
    includeLyrics: Optional[bool] = None

class FullSongArrangement(BaseModel):
    songTitle: str
    artist: str
    key: str
    instrument: str
    tuning: str = "E A D G B E"
    capoFret: int = 0
    progressionSummary: List[str] = Field(default_factory=list)
    tablature: List[TabSection] = Field(default_factory=list)
    chordDiagrams: List[ChordDiagram] = Field(default_factory=list)
    substitutions: List[Substitution] = Field(default_factory=list)
    practiceTips: List[str] = Field(default_factory=list)

# --- Backing Track ---
class BackingTrackStep(BaseModel):
    beat: int
    notes: List[str]
    duration: Optional[int] = None

class BackingTrackInstrument(BaseModel):
    instrument: Literal['drums', 'bass', 'keys', 'guitar', 'synth']
    steps: List[BackingTrackStep]

class BackingTrackResult(BaseModel):
    title: str
    style: str
    bpm: int
    key: str
    tracks: List[BackingTrackInstrument]
    youtubeQueries: Optional[List[str]] = None
    description: Optional[str] = None

# --- Rhythm ---
class RhythmPatternResult(BaseModel):
    pattern: str
    description: Optional[str] = ""
    difficulty: Optional[str] = ""
    timeSignature: Optional[str] = ""
    name: Optional[str] = ""

# --- Melody ---
class MelodySuggestionResult(BaseModel):
    melody: str
    description: Optional[str] = ""
    style: Optional[str] = ""
    key: Optional[str] = ""
    scale: Optional[str] = ""
    notes: Optional[List[str]] = None

# --- Improv ---
class ImprovTipsResult(BaseModel):
    response: str
    scales: Optional[List[str]] = None
    targetNotes: Optional[List[str]] = None
    techniques: Optional[List[str]] = None
    style: Optional[str] = None
    backingTrackSearch: Optional[str] = None

# --- Lyrics ---
class LyricsResult(BaseModel):
    lyrics: str
    title: Optional[str] = "Untitled"
    structure: Optional[str] = ""

# --- Practice Advice ---
class PracticeAdviceResult(BaseModel):
    advice: str
    insights: Optional[List[str]] = None
    nextGoals: Optional[List[str]] = None
    focusArea: Optional[str] = None
    recommendation: Optional[str] = None

# --- Lesson ---
class LessonResult(BaseModel):
    title: str
    lesson: str
    duration: str = "30 minutes"
    goals: List[str] = Field(default_factory=list)

# --- Health ---
class AIStatusResult(BaseModel):
    gemini_available: bool
    grok_available: bool
    status: str

# --- Audio Analysis ---
class DetectedChord(BaseModel):
    chord: str
    time: float
    confidence: float

class AudioAnalysisResult(BaseModel):
    filename: str
    bpm: float
    key: str
    mode: str
    keyConfidence: float
    durationSeconds: float
    detectedChords: List[DetectedChord] = Field(default_factory=list)
    chordSummary: List[str] = Field(default_factory=list)
    songTitle: Optional[str] = None
    songArtist: Optional[str] = None
    songAlbum: Optional[str] = None
    auddMatched: bool = False
    aiArrangement: Optional[dict] = None
