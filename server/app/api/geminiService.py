import os
import re
import json
import asyncio
import time
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- CONFIGURATION ---
# We prioritize the newest, fast models. 
# If they fail (429 Quota or 404 Not Found), we fall back to stable versions.
FALLBACK_MODELS = [
    'gemini-1.5-flash',       # Current standard for speed/cost
    'gemini-1.5-pro',         # Slower, but higher intelligence
    'gemini-2.0-flash-exp',   # Experimental (if available)
    'gemini-pro'              # 1.0 Legacy (Ultra stable backup)
]

class GeminiMusicService:
    def __init__(self):
        self.available = False

        if not GEMINI_API_KEY:
            print("❌ GEMINI_API_KEY is missing in .env file.")
            return

        try:
            genai.configure(api_key=GEMINI_API_KEY)
            
            # Global Settings
            self.generation_config = {
                "temperature": 0.2, 
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            }

            self.safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }

            self.system_instruction = (
                "You are an expert session musician and music theory professor. "
                "You strictly output valid JSON data matching specific schemas. "
                "You prioritize harmonic accuracy (slash chords, extensions) over simplicity. "
                "Do not include markdown formatting (like ```json)."
            )

            # We don't instantiate a specific model here anymore, we do it per request
            self.available = True 
            print(f"✓ Gemini Service Initialized (Fallback Chain: {', '.join(FALLBACK_MODELS)})")

        except Exception as e:
            print(f"❌ Gemini initialization error: {e}")

    async def _generate_json(self, prompt: str) -> dict:
        """
        Smart generation that switches models if Quota Exceeded (429), Overloaded (503), or Not Found (404).
        """
        if not self.available: 
            raise Exception("Gemini API not available")
        
        last_error = None

        # --- FALLBACK LOOP ---
        for model_name in FALLBACK_MODELS:
            try:
                # Instantiate specific model for this attempt
                current_model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=self.generation_config,
                    safety_settings=self.safety_settings,
                    system_instruction=self.system_instruction
                )

                # print(f"→ Trying {model_name}...") 

                # Run API call
                response = await asyncio.to_thread(current_model.generate_content, prompt)
                
                if not response.text: 
                    raise ValueError("Empty response")
                
                # CLEANER
                text = response.text.strip()
                text = re.sub(r"^```json\s*", "", text)
                text = re.sub(r"^```\s*", "", text)
                text = re.sub(r"\s*```$", "", text)
                
                return json.loads(text)

            except Exception as e:
                error_str = str(e)
                last_error = e
                
                # LOGIC: If it's a connection/quota/model error, try the next one.
                if "429" in error_str or "Quota" in error_str:
                    print(f"⚠ {model_name} rate limited. Switching...")
                    continue 
                elif "404" in error_str or "not found" in error_str.lower():
                    print(f"⚠ {model_name} not found (check SDK version). Switching...")
                    continue
                elif "503" in error_str or "Overloaded" in error_str:
                    print(f"⚠ {model_name} overloaded. Switching...")
                    continue
                else:
                    # If it's a parsing/logic error, don't switch models, just fail
                    print(f"❌ Error with {model_name}: {e}")
                    raise e 

        # If we get here, ALL models failed
        print("❌ All Gemini models exhausted.")
        raise Exception("Service busy. Please try again in 1 minute.")

    # ---------------------------
    # Generation Methods
    # ---------------------------

    async def generateSongArrangement(self, request) -> dict:
        instrument = getattr(request, 'instrument', 'Guitar')
        target_key = getattr(request, 'key', 'Original')
        is_simplified = getattr(request, 'simplify', False) 

        if target_key and target_key != "Original":
            key_instruction = f"TRANSPOSE the entire song to the key of {target_key}."
        else:
            key_instruction = "Use the ORIGINAL key of the recording."

        if is_simplified:
            complexity = "Constraint: BEGINNER MODE. Simplify chords to open triads."
        else:
            complexity = (
                "Constraint: PROFESSIONAL SESSION MODE.\n"
                "1. PRESERVE MODULATIONS (key changes).\n"
                "2. PRESERVE BASS LINES: Use slash chords (e.g. G/B, D/F#).\n"
                "3. PRESERVE EXTENSIONS: Keep 'sus4', 'add9', 'maj7' voicings."
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
                {{"lyrics": "Line of lyrics with chords aligned above", "isChordLine": true}},
                {{"lyrics": "Line of lyrics text", "isChordLine": false}}
              ]
            }}
          ],
          "chordDiagrams": [
            {{
                "chord": "C",
                "frets": [-1, 3, 2, 0, 1, 0], 
                "fingers": [0, 3, 2, 0, 1, 0],
                "capoFret": 0
            }}
          ],
          "substitutions": [
             {{
                "originalChord": "Target Chord", 
                "substitutedChord": "Sub Chord", 
                "theory": "Explanation"
             }}
          ],
          "practiceTips": ["Tip 1"]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_backing_track(self, prompt_text: str) -> dict:
        full_prompt = f"""
        Act as a music producer. Create a 1-bar loop (16 steps, 4/4) backing track: "{prompt_text}".
        
        Required JSON schema:
        {{
          "title": "Track Title",
          "style": "Style", 
          "bpm": 120,
          "key": "Key",
          "description": "Desc",
          "youtubeQueries": ["Query 1"],
          "tracks": [
            {{
              "instrument": "drums",
              "steps": [
                {{"beat": 0, "notes": ["kick"], "duration": 1}},
                {{"beat": 4, "notes": ["snare"], "duration": 1}}
              ]
            }},
            {{
              "instrument": "bass",
              "steps": [ {{"beat": 0, "notes": ["C2"], "duration": 2}} ]
            }},
            {{
              "instrument": "keys",
              "steps": [ {{"beat": 0, "notes": ["C4"], "duration": 4}} ]
            }}
          ]
        }}
        """
        return await self._generate_json(full_prompt)

    async def generate_lesson(self, skill: str, instrument: str, focus: str) -> dict:
        prompt = f"""
        Create a lesson plan for {instrument}, Level: {skill}, Topic: {focus}.
        
        Required JSON schema:
        {{
          "title": "Lesson Title",
          "overview": "Summary",
          "totalDuration": "45 mins",
          "lesson": "Markdown content...",
          "goals": ["Goal 1"],
          "duration": "45 mins" 
        }}
        """
        return await self._generate_json(prompt)

    async def generate_rhythm_pattern(self, time_sig: str, level: str) -> dict:
        prompt = f"""
        Create a rhythm pattern. Time: {time_sig}, Level: {level}.

        Required JSON schema:
        {{
          "name": "Pattern Name",
          "timeSignature": "{time_sig}",
          "description": "How to play",
          "pattern": [
            {{"beat": 1, "stroke": "Down", "duration": "quarter"}},
            {{"beat": 2, "stroke": "Up", "duration": "eighth"}}
          ]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_melody(self, key: str, style: str) -> dict:
        prompt = f"""
        Compose a short melody in {key}, {style} style.

        Required JSON schema:
        {{
          "scale": "Scale",
          "key": "{key}",
          "notes": ["C4"],
          "intervals": ["M3"],
          "suggestion": "Tip"
        }}
        """
        return await self._generate_json(prompt)

    async def generate_improv_tips(self, query: str) -> dict:
        prompt = f"""
        Improvisation advice for: "{query}".

        Required JSON schema:
        {{
            "style": "Style",
            "recommendedScales": ["Scale"],
            "tips": ["Tip"],
            "backingTrackSearch": "Query"
        }}
        """
        return await self._generate_json(prompt)

    async def generate_lyrics(self, topic: str, genre: str, mood: str) -> dict:
        prompt = f"""
        Write lyrics. Topic: {topic}, Genre: {genre}, Mood: {mood}.
        
        Required JSON schema:
        {{
            "title": "Title",
            "structure": ["Verse", "Chorus"],
            "lyrics": "Lyrics with [Chords]..."
        }}
        """
        return await self._generate_json(prompt)

    async def get_practice_advice(self, sessions: list) -> dict:
        prompt = f"""
        Analyze practice sessions: {json.dumps(sessions)}.

        Required JSON schema:
        {{
            "insight": "Observation",
            "recommendation": "Next step",
            "focusArea": "Focus"
        }}
        """
        return await self._generate_json(prompt)

# Singleton instance
gemini_music_service = GeminiMusicService()