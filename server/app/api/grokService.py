# server/app/api/grokService.py
import httpx
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()
GROK_API_KEY = os.getenv("GROK_API_KEY")

class GrokService:
    def __init__(self):
        self.api_key = GROK_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else None

    async def _call_grok(self, prompt: str):
        if not self.headers:
            raise Exception("GROK_API_KEY missing")

        payload = {
            "model": "grok-beta",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 3000
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post("https://api.x.ai/v1/chat/completions", json=payload, headers=self.headers)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            return content

    async def generate_song_arrangement(self, request):
        prompt = f"""
Return ONLY valid JSON for the song "{request.songQuery}" on {getattr(request, 'instrument', 'Guitar')}:

{{
  "songTitle": "...",
  "artist": "...",
  "key": "G Major",
  "instrument": "{getattr(request, 'instrument', 'Guitar')}",
  "tuning": "E A D G B E",
  "progressionSummary": ["G", "D", "Em", "C"],
  "tablature": [
    {{"section": "Intro", "lines": [
      {{"lyrics": "G       D", "isChordLine": true}},
      {{"lyrics": "God will make a way", "isChordLine": false}}
    ]}}
  ],
  "chordDiagrams": [
    {{"chord": "G", "frets": ["3","2","0","0","3","3"], "fingers": [2,1,0,0,3,4], "capoFret": 0}}
  ],
  "substitutions": [{"originalChord": "G", "substitutedChord": "G7", "theory": "Adds tension"}],
  "practiceTips": ["Practice at 70 BPM", "Smooth changes"]
}}

Use real chords from the actual song. Return ONLY JSON.
"""
        text = await self._call_grok(prompt)
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON from Grok")
        return json.loads(json_match.group(0))

    async def generate_backing_track(self, prompt: str):
        prompt += "\nReturn ONLY valid JSON with title, style, bpm, key, and tracks array (drums, bass, keys, guitar)."
        text = await self._call_grok(prompt)
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        return json.loads(json_match.group(0)) if json_match else {"title": "Custom Track", "bpm": 90, "key": "C", "tracks": []}

    async def generate_rhythm_pattern(self, time_sig: str, level: str):
        prompt = f"Generate a {level} {time_sig} drum pattern in 16th notes. Return only the pattern string like 'x--x--x--x--x--x-'."
        text = await self._call_grok(prompt)
        return {"pattern": re.search(r"[xX\-oO]+", text).group(0) if re.search(r"[xX\-oO]+", text) else "x---x---x---x---"}

    async def generate_melody(self, key: str, style: str):
        prompt = f"Write a short {style} melody in {key} using note names and durations (e.g. C4/4 E4/4 G4/2). Return only the melody string."
        text = await self._call_grok(prompt)
        return {"melody": text.strip().split('\n')[0]}

    async def generate_improv_tips(self, query: str):
        prompt = f"Give 3 concise improv tips for {query}. Return valid JSON with 'response', 'scales', 'techniques'."
        text = await self._call_grok(prompt)
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        return json.loads(json_match.group(0)) if json_match else {"response": "Play slow and listen", "scales": ["pentatonic"], "techniques": ["bends"]}

    async def generate_lyrics(self, topic: str, genre: str, mood: str):
        prompt = f"Write original lyrics about {topic} in {genre} style, {mood} mood. Verse-Chorus structure. No title."
        text = await self._call_grok(prompt)
        return {"lyrics": text.strip()}

    async def get_practice_advice(self, sessions):
        prompt = f"Analyze these practice sessions and give personalized advice: {json.dumps(sessions[:5])}"
        text = await self._call_grok(prompt)
        return {"advice": text.strip()}

    async def generate_lesson(self, skill: str, instrument: str, focus: str):
        prompt = f"Create a {skill} level {instrument} lesson focused on {focus}. Return markdown text only."
        text = await self._call_grok(prompt)
        return {"lesson": text.strip()}

grok_service = GrokService()