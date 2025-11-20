# server/app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Union, Literal

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
    name: str
    timeSignature: str
    description: str
    pattern: List[dict]

# --- Melody ---
class MelodySuggestionResult(BaseModel):
    scale: str
    key: str
    notes: List[str]
    intervals: List[str]
    suggestion: str

# --- Improv ---
class ImprovTipsResult(BaseModel):
    style: str
    recommendedScales: List[str]
    tips: List[str]
    backingTrackSearch: str

# --- Lyrics ---
class LyricsResult(BaseModel):
    title: str
    structure: List[str]
    lyrics: str

# --- Practice Advice ---
class PracticeAdviceResult(BaseModel):
    insight: str
    recommendation: str
    focusArea: str

# --- Lesson ---
class LessonResult(BaseModel):
    title: str
    lesson: str
    duration: str
    goals: List[str]
