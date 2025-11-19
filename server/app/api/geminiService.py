# server/app/api/geminiService.py
import google.generativeai as genai
import os
import json
import re
import logging
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
logger = logging.getLogger(__name__)

class GeminiMusicService:
    def __init__(self):
        self.model = None
        self.available = False
        
        if not GEMINI_API_KEY:
            print("GEMINI_API_KEY missing — Gemini fallback disabled")
            return
        
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            # CORRECT MODEL NAME NOV 2025
            model_name = "gemini-1.5-flash-001"  # This works 100%
            
            self.model = genai.GenerativeModel(
                model_name,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 8192,
                }
            )
            # Test
            test = self.model.generate_content("Say OK")
            if "OK" in test.text.upper():
                self.available = True
                print(f"Gemini ready: {model_name}")
        except Exception as e:
            print(f"Gemini init failed: {e}")

    async def generateSongArrangement(self, request) -> dict:
        if not self.available:
            raise Exception("Gemini not available")

        instrument = getattr(request, 'instrument', 'Guitar')
        simplify = "Use only easy open chords" if getattr(request, 'simplify', True) else "Include 7ths/sus"

        prompt = f'''
You are UltimateGuitar. Return ONLY valid JSON for the song "{request.songQuery}" on {instrument}.

{simplify}

Return ONLY this exact structure:
{{
  "songTitle": "...",
  "artist": "...",
  "key": "G Major",
  "instrument": "{instrument}",
  "tuning": "E A D G B E",
  "progressionSummary": ["G", "D", "Em", "C"],
  "tablature": [
    {{"section": "Verse", "lines": [
      {{"lyrics": "G           D", "isChordLine": true}},
      {{"lyrics": "God will make a way", "isChordLine": false}}
    ]}}
  ],
  "chordDiagrams": [
    {{"chord": "G", "frets": [3,2,0,0,3,3], "fingers": [2,1,0,0,3,4], "capoFret": 0}}
  ],
  "substitutions": [],
  "practiceTips": []
}}

Use real chords & lyrics. Return ONLY JSON.
'''

        response = self.model.generate_content(prompt)
        text = response.text.strip()

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON from Gemini")
        
        data = json.loads(match.group(0))
        print("Gemini fallback successful")
        return data

gemini_music_service = GeminiMusicService()