import os
import re
import json
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class GeminiMusicService:
    def __init__(self):
        self.model = None
        self.available = False

        if not GEMINI_API_KEY:
            print("❌ GEMINI_API_KEY is missing in .env file.")
            return

        try:
            genai.configure(api_key=GEMINI_API_KEY)

            # Using Gemini 2.0 Flash
            self.model = genai.GenerativeModel('gemini-2.0-flash')

            # Connectivity test
            test_response = self.model.generate_content("Test connection. Reply with 'OK'.")
            if test_response and hasattr(test_response, 'text') and test_response.text.strip() == "OK":
                self.available = True
                print("✓ Gemini 2.0 Flash Connected Successfully")
            else:
                print("❌ Gemini connection test failed.")
        except Exception as e:
            print(f"❌ Gemini initialization error: {e}")

    async def _generate_json(self, prompt: str) -> dict:
        """Send prompt to Gemini API and parse JSON reliably."""
        if not self.available:
            raise Exception("Gemini API is not available. Check your API Key.")

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )

            if not response or not getattr(response, 'text', None):
                raise ValueError("Gemini returned an empty response.")

            text = response.text.strip()

            try:
                data = json.loads(text)
            except json.JSONDecodeError:
                # Attempt to extract JSON if extra text exists
                match = re.search(r"\{.*\}", text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                else:
                    raise ValueError(f"Could not parse JSON: {text[:200]}...")

            # Unwrap list if needed
            if isinstance(data, list):
                if len(data) > 0:
                    return data[0]
                else:
                    raise ValueError("Gemini returned an empty list.")

            return data

        except Exception as e:
            print(f"Error generating content: {e}")
            raise e

    # ---------------------------
    # Real data generation methods
    # ---------------------------

    async def generateSongArrangement(self, request) -> dict:
        instrument = getattr(request, 'instrument', 'Guitar')
        simplify = "Use only easy open chords" if getattr(request, 'simplify', True) else "Include 7ths and suspended chords"

        prompt = f"""
        You are an expert music transcriber. Create a valid JSON song sheet for "{request.songQuery}" on {instrument}.
        Constraint: {simplify}.

        JSON schema:
        {{
          "songTitle": "Exact Song Title",
          "artist": "Artist Name", 
          "key": "Key (e.g. C Major)",
          "instrument": "{instrument}",
          "tuning": "Standard (E A D G B E)",
          "progressionSummary": ["Chord1", "Chord2"],
          "tablature": [
            {{
              "section": "Verse 1",
              "lines": [
                {{"lyrics": "Line of lyrics with chords aligned above", "isChordLine": true}},
                {{"lyrics": "Line of lyrics text", "isChordLine": false}}
              ]
            }}
          ],
          "chordDiagrams": [
            {{"chord": "C", "frets": [-1,3,2,0,1,0], "fingers": [0,3,2,0,1,0], "capoFret": 0}}
          ],
          "substitutions": [],
          "practiceTips": ["Specific tip 1", "Specific tip 2"]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_backing_track(self, prompt: str) -> dict:
        full_prompt = f"""
        Act as a music producer. Create a backing track arrangement for this request: "{prompt}".

        Return ONLY valid JSON using this schema:
        {{
          "title": "Track Title",
          "style": "Detected Style", 
          "bpm": 120,
          "key": "Detected Key",
          "tracks": [
            {{
              "instrument": "drums",
              "steps": [
                {{"beat": 1, "notes": ["kick"]}},
                {{"beat": 2, "notes": ["snare"]}}
              ]
            }}
          ],
          "youtubeQueries": ["Search query 1", "Search query 2"],
          "description": "Brief description of the vibe"
        }}
        """
        return await self._generate_json(full_prompt)

    async def generate_lesson(self, skill: str, instrument: str, focus: str) -> dict:
        prompt = f"""
        You are a music teacher. Generate a lesson plan for a {skill} {instrument} player focusing on "{focus}".
        Must be educational, around 600 words.

        Return valid JSON:
        {{
          "lesson": "# {focus.title()} Lesson\\n\\n## Introduction\\n[Content in Markdown]",
          "title": "{focus.title()} Lesson",
          "duration": "30-45 minutes", 
          "goals": ["Specific Goal 1", "Specific Goal 2", "Specific Goal 3"]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_rhythm_pattern(self, time_sig: str, level: str) -> dict:
        prompt = f"""
        Create a rhythm/strumming pattern for a {level} player in {time_sig} time signature.

        Return valid JSON:
        {{
          "name": "Pattern Name",
          "timeSignature": "{time_sig}",
          "description": "How to play it",
          "pattern": [
            {{"beat": 1, "stroke": "Down", "duration": "quarter"}},
            {{"beat": 2, "stroke": "Up", "duration": "eighth"}}
          ]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_melody(self, key: str, style: str) -> dict:
        prompt = f"""
        Compose a short melody in the key of {key} in {style} style.

        Return valid JSON:
        {{
          "scale": "Scale Used (e.g. Minor Pentatonic)",
          "key": "{key}",
          "notes": ["Note1", "Note2", "Note3"],
          "intervals": ["Interval1", "Interval2"],
          "suggestion": "Advice on phrasing this melody"
        }}
        """
        return await self._generate_json(prompt)

    async def generate_improv_tips(self, query: str) -> dict:
        prompt = f"""
        Provide improvisation tips for: "{query}".

        Return valid JSON:
        {{
            "style": "Identified Style",
            "recommendedScales": ["Scale 1", "Scale 2"],
            "tips": ["Tip 1", "Tip 2"],
            "backingTrackSearch": "Youtube search query"
        }}
        """
        return await self._generate_json(prompt)

    async def generate_lyrics(self, topic: str, genre: str, mood: str) -> dict:
        prompt = f"""
        Write original song lyrics.
        Topic: {topic}
        Genre: {genre}
        Mood: {mood}

        Return valid JSON:
        {{
            "title": "Creative Title",
            "structure": ["Verse 1", "Chorus", "Verse 2"],
            "lyrics": "Verse 1:\\n[lyrics]\\n\\nChorus:\\n[chorus]"
        }}
        """
        return await self._generate_json(prompt)

    async def get_practice_advice(self, sessions: list) -> dict:
        prompt = f"""
        Act as a practice coach. Analyze these past sessions: {json.dumps(sessions)}.

        Return valid JSON:
        {{
            "insight": "Observation",
            "recommendation": "Next action",
            "focusArea": "Technical area to improve"
        }}
        """
        return await self._generate_json(prompt)


# Singleton instance
gemini_music_service = GeminiMusicService()
