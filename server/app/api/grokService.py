import httpx
import json
import re
import os
import asyncio
from dotenv import load_dotenv
from app.config import GROK_MODELS, GROQ_MODELS

load_dotenv()
GROK_API_KEY = os.getenv("GROK_API_KEY") or os.getenv("GROQ_API_KEY")


class GrokService:
    def __init__(self):
        self.api_key = GROK_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else None
        self.available = bool(self.headers)
        self.is_groq = bool(self.api_key and self.api_key.startswith("gsk_"))
        self.api_url = (
            "https://api.groq.com/openai/v1/chat/completions"
            if self.is_groq
            else "https://api.x.ai/v1/chat/completions"
        )
        self.models = GROQ_MODELS if self.is_groq else GROK_MODELS
        provider = "Groq" if self.is_groq else "xAI Grok"
        if self.available:
            print(f"AI fallback service initialized ({provider})")

    async def _call_grok(self, prompt: str, max_tokens: int = 3000):
        if not self.headers:
            raise Exception("GROK_API_KEY or GROQ_API_KEY missing")

        last_error = None
        for model in self.models:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.75,
                "max_tokens": max_tokens,
                "top_p": 0.92,
            }
            try:
                async with httpx.AsyncClient(timeout=90.0) as client:
                    resp = await client.post(
                        self.api_url,
                        json=payload,
                        headers=self.headers,
                    )
                    if resp.status_code == 429:
                        print(f"Grok rate limited on {model}, trying next model...")
                        continue
                    if resp.status_code == 404:
                        print(f"Grok model {model} not found, trying next...")
                        continue
                    resp.raise_for_status()
                    return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                last_error = e
                print(f"Grok request failed for {model}: {e}")
                continue

        raise last_error or Exception("All Grok models failed")

    def _extract_json(self, text: str):
        if not text:
            return None
        cleaned = re.sub(r"^```json\s*", "", text.strip())
        cleaned = re.sub(r"^```\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        match = re.search(r"\{(?:[^{}]|(?:\{[^{}]*\}))*\}", cleaned, re.DOTALL)
        if not match:
            return None
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None

    async def generate_song_arrangement(self, request):
        if not self.available:
            raise Exception("Grok service not available")

        instrument = getattr(request, "instrument", "Guitar")
        target_key = getattr(request, "key", "Original")
        is_simplified = getattr(request, "simplify", False)

        key_instruction = (
            f"TRANSPOSE the entire song to the key of {target_key}."
            if target_key and target_key != "Original"
            else "Use the ORIGINAL key of the recording."
        )
        complexity = (
            "Use only easy open chords."
            if is_simplified
            else "Include richer voicings, slash chords, and extensions."
        )

        prompt = f"""
Act as a professional transcriber. Create a valid JSON song sheet for "{request.songQuery}" on {instrument}.
{key_instruction}
{complexity}

Required JSON schema:
{{
  "songTitle": "Exact Song Title",
  "artist": "Artist Name",
  "key": "Key (e.g. C Major)",
  "instrument": "{instrument}",
  "tuning": "Standard (E A D G B E)",
  "capoFret": 0,
  "progressionSummary": ["Chord1", "Chord2"],
  "tablature": [
    {{
      "section": "Verse 1",
      "lines": [
        {{"lyrics": "Line with chords aligned above", "isChordLine": true}},
        {{"lyrics": "Line of lyrics text", "isChordLine": false}}
      ]
    }}
  ],
  "chordDiagrams": [
    {{"chord": "C", "frets": [-1, 3, 2, 0, 1, 0], "fingers": [0, 3, 2, 0, 1, 0], "capoFret": 0}}
  ],
  "substitutions": [],
  "practiceTips": ["Tip 1"]
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt, max_tokens=4000)
        data = self._extract_json(text)
        if not data:
            raise ValueError("Grok did not return valid JSON")
        return data

    async def generate_backing_track(self, prompt: str):
        if not self.available:
            raise Exception("Grok service not available")

        full_prompt = f"""
Act as a music producer. Create a 1-bar loop (16 steps, 4/4) backing track: "{prompt}"

Required JSON schema:
{{
  "title": "Track Title",
  "style": "Style",
  "bpm": 120,
  "key": "Key",
  "description": "Description",
  "youtubeQueries": ["Query 1"],
  "tracks": [
    {{"instrument": "drums", "steps": [{{"beat": 0, "notes": ["kick"], "duration": 1}}]}},
    {{"instrument": "bass", "steps": [{{"beat": 0, "notes": ["C2"], "duration": 2}}]}}
  ]
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(full_prompt)
        data = self._extract_json(text)
        if not data:
            raise ValueError("Grok did not return valid JSON for backing track")
        return data

    async def generate_rhythm_pattern(self, time_sig: str, level: str):
        if not self.available:
            raise Exception("Grok service not available")

        prompt = f"""
Create a rhythm pattern. Time: {time_sig}, Level: {level}.

Required JSON schema:
{{
  "name": "Pattern Name",
  "timeSignature": "{time_sig}",
  "description": "How to play",
  "pattern": "x-x-x-x-x-x-x-x-",
  "difficulty": "{level}"
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        if not data or "pattern" not in data:
            raise ValueError("Grok did not return valid rhythm pattern")
        return data

    async def generate_melody(self, key: str, style: str):
        if not self.available:
            raise Exception("Grok service not available")

        prompt = f"""
Compose a short melody in {key}, {style} style using note names and durations.

Required JSON schema:
{{
  "melody": "C4 E4 G4 C5 | B4 G4 E4 C4",
  "description": "Brief description of the melody",
  "style": "{style}",
  "key": "{key}"
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        if not data or "melody" not in data:
            raise ValueError("Grok did not return valid melody")
        return data

    async def generate_improv_tips(self, query: str):
        if not self.available:
            raise Exception("Grok service not available")

        prompt = f"""
Improvisation advice for: "{query}".

Required JSON schema:
{{
  "response": "Detailed paragraph of improv advice",
  "scales": ["Scale 1", "Scale 2"],
  "targetNotes": ["Note 1", "Note 2"],
  "techniques": ["Technique 1", "Technique 2"]
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        if not data:
            raise ValueError("Grok did not return valid improv tips")
        return data

    async def generate_lyrics(self, topic: str, genre: str, mood: str):
        if not self.available:
            raise Exception("Grok service not available")

        prompt = f"""
Write lyrics. Topic: {topic}, Genre: {genre}, Mood: {mood}.

Required JSON schema:
{{
  "title": "Song Title",
  "structure": "Verse / Chorus / Bridge",
  "lyrics": "Full lyrics with section labels"
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        if not data or "lyrics" not in data:
            raise ValueError("Grok did not return valid lyrics")
        return data

    async def get_practice_advice(self, sessions):
        if not self.available:
            raise Exception("Grok service not available")

        prompt = f"""
Analyze these practice sessions and give personalized advice: {json.dumps(sessions[:5])}

Required JSON schema:
{{
  "advice": "Main personalized advice paragraph",
  "insights": ["Insight 1", "Insight 2"],
  "nextGoals": ["Goal 1", "Goal 2"]
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt)
        data = self._extract_json(text)
        if not data or "advice" not in data:
            raise ValueError("Grok did not return valid practice advice")
        return data

    async def generate_lesson(self, skill: str, instrument: str, focus: str):
        if not self.available:
            raise Exception("Grok service not available")

        prompt = f"""
Create a lesson plan for {instrument}, Level: {skill}, Topic: {focus}.

Required JSON schema:
{{
  "title": "Lesson Title",
  "lesson": "Full markdown lesson content (600-900 words)",
  "duration": "30-45 minutes",
  "goals": ["Goal 1", "Goal 2", "Goal 3"]
}}
Return ONLY valid JSON.
"""
        text = await self._call_grok(prompt, max_tokens=4000)
        data = self._extract_json(text)
        if not data or "lesson" not in data:
            raise ValueError("Grok did not return valid lesson")
        return data


grok_service = GrokService()
