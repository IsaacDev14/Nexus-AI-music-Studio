# server/app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Union, Literal, Optional

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

# --- Other Features ---
class RhythmPatternResult(BaseModel):
    pattern: str
    description: Optional[str] = None
    difficulty: Optional[str] = None

class MelodySuggestionResult(BaseModel):
    melody: str
    description: Optional[str] = None
    style: Optional[str] = None

class ImprovTipsResult(BaseModel):
    response: str
    scales: Optional[List[str]] = None
    targetNotes: Optional[List[str]] = None
    techniques: Optional[List[str]] = None

class LyricsResult(BaseModel):
    lyrics: str
    title: Optional[str] = None
    structure: Optional[str] = None

class PracticeAdviceResult(BaseModel):
    advice: str
    insights: Optional[List[str]] = None
    nextGoals: Optional[List[str]] = None

class LessonResult(BaseModel):
    lesson: str
    title: Optional[str] = None
    duration: Optional[str] = None
    goals: Optional[List[str]] = None