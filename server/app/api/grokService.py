import httpx
import json
import re
import os
import time
from dotenv import load_dotenv

load_dotenv()
GROK_API_KEY = os.getenv("GROK_API_KEY")


class GrokService:
    def __init__(self):
        self.api_key = GROK_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else None

    async def _call_grok(self, prompt: str, max_tokens: int = 3000, retries: int = 3):
        if not self.headers:
            raise Exception("GROK_API_KEY missing")

        payload = {
            "model": "grok-beta",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.75,
            "max_tokens": max_tokens,
            "top_p": 0.92
        }

        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(timeout=90.0) as client:
                    resp = await client.post(
                        "https://api.x.ai/v1/chat/completions",
                        json=payload,
                        headers=self.headers
                    )
                    if resp.status_code == 429:
                        wait = 2 ** attempt
                        print(f"Grok rate limited — retrying in {wait}s (attempt {attempt + 1})")
                        time.sleep(wait)
                        continue
                    resp.raise_for_status()
                    return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                if attempt == retries:
                    raise e
                time.sleep(2 ** attempt)

    def _extract_json(self, text: str):
        match = re.search(r"\{(?:[^{}]|(?:\{[^{}]*\}))*\}", text, re.DOTALL)
        if not match:
            return None
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None

    async def generate_song_arrangement(self, request):
        instrument = getattr(request, 'instrument', 'Guitar')
        simplify = "Use only easy open chords" if getattr(request, 'simplify', True) else "Include richer voicings"

        prompt = f"""
You are UltimateGuitar.com's best transcriber.
Song: "{request.songQuery}"
Instrument: {instrument}
{simplify}

Return ONLY valid JSON — no markdown:
{{
  "songTitle": "Exact title",
  "artist": "Artist name",
  "key": "e.g. C Major",
  "instrument": "{instrument}",
  "tuning": "E A D G B E",
  "progressionSummary": ["C", "Am", "F", "G"],
  "tablature": [
    {{
      "section": "Verse 1",
      "lines": [
        {{"lyrics": "C               Am", "isChordLine": true}},
        {{"lyrics": "Fly me to the moon", "isChordLine": false}}
      ]
    }}
  ],
  "chordDiagrams": [
    {{"chord": "C", "frets": [-1,3,2,0,1,0], "fingers": [0,3,2,0,1,0], "capoFret": 0}}
  ],
  "substitutions": [],
  "practiceTips": ["Practice at 70 BPM", "Focus on clean changes"]
}}
Use real chords & lyrics. Return ONLY JSON.
"""

        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        if not data:
            raise ValueError("Grok did not return valid JSON")
        return data

    async def generate_backing_track(self, prompt: str):
        prompt += "\nReturn ONLY valid JSON with title, style, bpm, key, and tracks array."
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        return data or {"title": "Custom Track", "bpm": 90, "key": "C", "tracks": []}

    async def generate_rhythm_pattern(self, time_sig: str, level: str):
        prompt = f"Generate a {level} {time_sig} drum pattern in 16th notes. Return only the pattern string like 'x--x--x--x--x--x-'."
        text = await self._call_grok(prompt)
        pattern_match = re.search(r"[xX\-oO]+", text)
        return {"pattern": pattern_match.group(0) if pattern_match else "x---x---x---x---"}

    async def generate_melody(self, key: str, style: str):
        prompt = f"Write a short {style} melody in {key} using note names and durations (e.g. C4/4 E4/4 G4/2). Return only the melody string."
        text = await self._call_grok(prompt)
        return {"melody": text.strip().split('\n')[0]}

    async def generate_improv_tips(self, query: str):
        prompt = f"Give 3 concise improv tips for {query}. Return valid JSON with 'response', 'scales', 'techniques'."
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        return data or {"response": "Play slow and listen", "scales": ["pentatonic"], "techniques": ["bends"]}

    async def generate_lyrics(self, topic: str, genre: str, mood: str):
        prompt = f"Write original lyrics about {topic} in {genre} style, {mood} mood. Verse-Chorus structure. No title."
        text = await self._call_grok(prompt)
        return {"lyrics": text.strip()}

    async def get_practice_advice(self, sessions):
        prompt = f"Analyze these practice sessions and give personalized advice: {json.dumps(sessions[:5])}"
        text = await self._call_grok(prompt)
        return {"advice": text.strip()}

    async def generate_lesson(self, skill: str, instrument: str, focus: str):
        prompt = f"""
You are an excellent, patient {instrument} teacher.
Write a clear, detailed, and encouraging lesson for a {skill.title()} player focusing on {focus}.
Use Markdown. Aim for 600–900 words — thorough but readable.

Structure exactly like this:

# {focus.title()} – {skill.title()} Level Lesson

## Goals Today
- Goal 1
- Goal 2
- Goal 3

## Warm-Up (5 mins)
Brief warm-up with tempo

## Core Idea
Explain the concept clearly with 1–2 examples

## 3 Exercises
Include tabs/fingerings:
```tab
Exercise 1 – Slow & Clean (60 BPM)
e|---------------------|
B|---------------------|
G|---------------------|
...
\\```
"""

grok_service = GrokService()