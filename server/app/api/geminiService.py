# server/app/api/geminiService.py
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class GeminiMusicService:
    def __init__(self):
        self.model = None
        self.available = False
        
        if not GEMINI_API_KEY:
            print("GEMINI_API_KEY missing — fallback disabled")
            return
        
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            # THIS IS THE CORRECT MODEL NAME (November 2025)
            model_name = "gemini-1.5-flash"  # ← THIS WORKS 100%
            
            self.model = genai.GenerativeModel(
                model_name,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 8192,
                }
            )
            # Quick test
            test = self.model.generate_content("Say OK")
            if test and test.text and "OK" in test.text.upper():
                self.available = True
                print("Gemini 1.5 Flash READY — Strong fallback active")
        except Exception as e:
            print(f"Gemini init failed: {e}")

    async def generateSongArrangement(self, request) -> dict:
        if not self.available:
            raise Exception("Gemini not available")

        instrument = getattr(request, 'instrument', 'Guitar')
        simplify = "Use only easy open chords" if getattr(request, 'simplify', True) else "Include 7ths/sus"

        prompt = f'''
You are UltimateGuitar.com. Return ONLY valid JSON for the song "{request.songQuery}" on {instrument}.

{simplify}

Return ONLY this exact structure:
{{
  "songTitle": "Fly Me to the Moon",
  "artist": "Frank Sinatra",
  "key": "C Major",
  "instrument": "{instrument}",
  "tuning": "E A D G B E",
  "progressionSummary": ["Am7", "Dm7", "G7", "Cmaj7"],
  "tablature": [
    {{
      "section": "A Section",
      "lines": [
        {{"lyrics": "Am7         Dm7", "isChordLine": true}},
        {{"lyrics": "Fly me to the moon", "isChordLine": false}}
      ]
    }}
  ],
  "chordDiagrams": [
    {{"chord": "Am7", "frets": [-1,0,2,0,1,0], "fingers": [0,0,2,0,1,0], "capoFret": 0}}
  ],
  "substitutions": [],
  "practiceTips": ["Swing feel", "Brush strokes on guitar"]
}}

Use real chords and lyrics. Return ONLY JSON.
'''

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            match = re.search(r"\{.*\}", text, re.DOTALL)
            if not match:
                raise ValueError("No JSON from Gemini")

            data = json.loads(match.group(0))
            print("Gemini fallback SUCCESS")
            return data

        except Exception as e:
            print(f"Gemini failed: {e}")
            raise

    async def generate_lesson(self, skill: str, instrument: str, focus: str):
        prompt = f"""
Create a detailed lesson for a {skill} level {instrument} player on "{focus}".
600–900 words. Markdown format.

Structure:
# {focus.title()} Lesson ({skill.title()})

## Goals
## Warm-Up
## Core Concept
## 3 Exercises (include tabs)
## Apply to Music
## Weekly Practice Plan
## Common Mistakes
## Pro Tip

Be encouraging. Return only markdown.
"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if not text.startswith("#"):
                text = f"# {focus.title()} Lesson\n\n{text}"
            return {"lesson": text}
        except Exception as e:
            raise Exception("Gemini lesson failed")

gemini_music_service = GeminiMusicService()