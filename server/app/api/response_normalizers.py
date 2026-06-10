"""Normalize heterogeneous AI provider responses into client-expected shapes."""
from typing import Any


def normalize_rhythm(data: dict, time_sig: str = "4/4", level: str = "Beginner") -> dict:
    if isinstance(data.get("pattern"), str):
        return {
            "pattern": data["pattern"],
            "description": data.get("description", ""),
            "difficulty": data.get("difficulty", level),
            "timeSignature": data.get("timeSignature", time_sig),
            "name": data.get("name", f"{level} {time_sig} Pattern"),
        }

    pattern_list = data.get("pattern", [])
    if isinstance(pattern_list, list) and pattern_list:
        strokes = []
        for step in pattern_list:
            stroke = step.get("stroke", "x") if isinstance(step, dict) else "x"
            strokes.append(stroke[0].lower() if stroke else "x")
        pattern_str = "-".join(strokes) if strokes else "x-x-x-x-"
    else:
        pattern_str = "x-x-x-x-"

    return {
        "pattern": pattern_str,
        "description": data.get("description", ""),
        "difficulty": data.get("difficulty", level),
        "timeSignature": data.get("timeSignature", time_sig),
        "name": data.get("name", f"{level} {time_sig} Pattern"),
    }


def normalize_melody(data: dict, key: str = "C Major", style: str = "Pop") -> dict:
    if data.get("melody"):
        return {
            "melody": data["melody"],
            "description": data.get("description", data.get("suggestion", "")),
            "style": data.get("style", style),
            "key": data.get("key", key),
        }

    notes = data.get("notes", [])
    if isinstance(notes, list) and notes:
        melody_str = " ".join(str(n) for n in notes)
    else:
        melody_str = data.get("suggestion", "C4 E4 G4 C5")

    return {
        "melody": melody_str,
        "description": data.get("suggestion", data.get("description", "")),
        "style": data.get("style", style),
        "key": data.get("key", key),
        "scale": data.get("scale", ""),
        "notes": notes if isinstance(notes, list) else [],
    }


def normalize_improv(data: dict, query: str = "") -> dict:
    if data.get("response"):
        return {
            "response": data["response"],
            "scales": data.get("scales", data.get("recommendedScales", [])),
            "targetNotes": data.get("targetNotes", []),
            "techniques": data.get("techniques", data.get("tips", [])),
        }

    tips = data.get("tips", [])
    response = "\n".join(f"- {t}" for t in tips) if isinstance(tips, list) else str(tips)
    scales = data.get("recommendedScales", data.get("scales", []))

    return {
        "response": response or data.get("backingTrackSearch", f"Tips for: {query}"),
        "scales": scales,
        "targetNotes": data.get("targetNotes", []),
        "techniques": tips if isinstance(tips, list) else [],
        "style": data.get("style", ""),
        "backingTrackSearch": data.get("backingTrackSearch", ""),
    }


def normalize_lyrics(data: dict) -> dict:
    lyrics = data.get("lyrics", "")
    structure = data.get("structure", [])
    if isinstance(structure, list):
        structure_str = " / ".join(structure)
    else:
        structure_str = str(structure) if structure else ""

    return {
        "lyrics": lyrics,
        "title": data.get("title", "Untitled"),
        "structure": structure_str,
    }


def normalize_practice_advice(data: dict) -> dict:
    advice = (
        data.get("advice")
        or data.get("recommendation")
        or data.get("insight")
        or "Keep practicing consistently."
    )
    insights = data.get("insights", [])
    if not insights and data.get("insight"):
        insights = [data["insight"]]
    next_goals = data.get("nextGoals", [])
    if not next_goals and data.get("focusArea"):
        next_goals = [data["focusArea"]]

    return {
        "advice": advice,
        "insights": insights,
        "nextGoals": next_goals,
        "focusArea": data.get("focusArea", ""),
        "recommendation": data.get("recommendation", advice),
    }


def normalize_lesson(data: dict) -> dict:
    lesson = data.get("lesson", data.get("overview", ""))
    return {
        "lesson": lesson,
        "title": data.get("title", "Lesson"),
        "duration": data.get("duration", data.get("totalDuration", "30 minutes")),
        "goals": data.get("goals", []),
    }
