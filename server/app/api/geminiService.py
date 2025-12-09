import os
import re
import json
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

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

            # Configuration: Low temperature for consistent JSON
            generation_config = {
                "temperature": 0.3,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            }

            # Safety settings
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }

            # System Instruction: Define the persona and strict JSON rules
            system_instruction = (
                "You are an expert music teacher and producer. "
                "You strictly output valid JSON data. "
                "Do not include markdown formatting (like ```json) in the response. "
                "When writing long text inside JSON, always use \\n for new lines, never actual line breaks."
            )

            # Initialize Gemini 2.5 Flash
            self.model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                generation_config=generation_config,
                safety_settings=safety_settings,
                system_instruction=system_instruction
            )

            # Sync connectivity test
            try:
                test_response = self.model.generate_content("Reply with this JSON: {\"status\": \"OK\"}")
                if test_response and test_response.text:
                    self.available = True
                    print(f"✓ Connected to {self.model.model_name} successfully.")
                else:
                    print(f"❌ Gemini connection test failed: No response text.")
            except Exception as conn_err:
                 print(f"❌ Gemini connection test failed: {conn_err}")

        except Exception as e:
            print(f"❌ Gemini initialization error: {e}")

    async def _generate_json(self, prompt: str) -> dict:
        """Send prompt to Gemini API and parse JSON reliably."""
        if not self.available or not self.model:
            raise Exception("Gemini API is not available. Check your API Key.")

        try:
            # Run blocking generate_content in a thread
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt
            )

            if not response or not getattr(response, 'text', None):
                raise ValueError("Gemini returned an empty response.")

            text = response.text.strip()

            # --- CLEANING PHASE ---
            # 1. Remove Markdown code blocks (```json ... ```)
            text = re.sub(r"^```json\s*", "", text)
            text = re.sub(r"^```\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

            # 2. Attempt Parse
            try:
                # strict=False allows control characters inside strings
                data = json.loads(text, strict=False)
            except json.JSONDecodeError:
                # --- RECOVERY PHASE ---
                match = re.search(r"\{.*\}", text, re.DOTALL)
                if match:
                    json_str = match.group(0)
                    try:
                        data = json.loads(json_str, strict=False)
                    except json.JSONDecodeError:
                        # "Nuclear" option: Replace actual newlines with \n just to get it to parse
                        clean_str = json_str.replace('\n', '\\n').replace('\r', '')
                        try:
                            data = json.loads(clean_str, strict=False)
                        except Exception:
                            print(f"FAILED JSON RAW: {text}") # Log raw for debugging
                            raise ValueError(f"Could not parse JSON even after cleaning.")
                else:
                    raise ValueError(f"Could not find JSON object in response.")

            # Unwrap list if needed
            if isinstance(data, list):
                if len(data) > 0:
                    return data[0]
                else:
                    return {} 

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
        Create a valid JSON song sheet for "{request.songQuery}" on {instrument}.
        Constraint: {simplify}.

        Required JSON schema:
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
          "substitutions": [
             {{
                "originalChord": "Target Chord (e.g. F)", 
                "substitutedChord": "Easy Version (e.g. Fmaj7)", 
                "theory": "Why this substitution works"
             }}
          ],
          "practiceTips": ["Specific tip 1", "Specific tip 2"]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_backing_track(self, prompt_text: str) -> dict:
        """
        Generates a 1-bar loop playable by a step sequencer.
        instruments: drums, bass, keys.
        """
        full_prompt = f"""
        Create a short 1-bar loop (16 steps, 4/4 time) backing track based on this request: "{prompt_text}".
        
        Return a JSON object playable by a step sequencer.
        
        Instruments Rules:
        1. "drums": Valid notes are strictly "kick", "snare", "hat", "open_hat", "clap".
        2. "bass": Monophonic. Notes should be "Note+Octave" (e.g., "C2", "F#1").
        3. "keys": Polyphonic chords. Notes should be arrays of "Note+Octave" (e.g., ["C4", "E4", "G4"]).

        Required JSON schema:
        {{
          "title": "Track Title",
          "style": "Detected Style", 
          "bpm": 120,
          "description": "Brief description of the vibe",
          "youtubeQueries": ["Search query 1", "Search query 2"],
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
              "steps": [
                 {{"beat": 0, "notes": ["C2"], "duration": 2}}
              ]
            }},
            {{
              "instrument": "keys",
              "steps": [
                 {{"beat": 0, "notes": ["C4", "E4", "G4"], "duration": 4}}
              ]
            }}
          ]
        }}
        """
        return await self._generate_json(full_prompt)

    async def generate_lesson(self, skill: str, instrument: str, focus: str) -> dict:
        """
        Generates a hierarchical lesson plan with timed sections.
        """
        prompt = f"""
        Create a detailed music lesson plan for {instrument}.
        Level: {skill}
        Topic: {focus}
        Duration: 45 minutes.
        
        Provide a structured plan. 
        IMPORTANT: In the 'content' arrays, do NOT use markdown formatting like asterisks (*) or dashes (-). Just provide plain text strings for each point.

        Required JSON schema:
        {{
          "title": "{focus.title()} Lesson",
          "overview": "Brief encouraging summary of goals",
          "totalDuration": 45,
          "sections": [
            {{
                "heading": "Introduction & Warmup",
                "durationMin": 5,
                "content": ["Step 1 description", "Step 2 description"]
            }},
            {{
                "heading": "Main Concept: {focus}",
                "durationMin": 20,
                "content": ["Explanation point 1", "Exercise instruction"]
            }}
          ],
          "youtubeQueries": ["Search query 1", "Search query 2"]
        }}
        """
        return await self._generate_json(prompt)

    async def generate_rhythm_pattern(self, time_sig: str, level: str) -> dict:
        prompt = f"""
        Create a rhythm/strumming pattern for a {level} player in {time_sig} time signature.

        Required JSON schema:
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
        Compose a short melody motif (4-8 bars) in the key of {key} in {style} style.

        Required JSON schema:
        {{
          "scale": "Scale Used",
          "key": "{key}",
          "notes": ["C4 (Quarter)", "E4 (Eighth)"],
          "intervals": ["Major 3rd", "Perfect 5th"],
          "suggestion": "Brief text description of the melody's character"
        }}
        """
        return await self._generate_json(prompt)

    async def generate_improv_tips(self, query: str) -> dict:
        prompt = f"""
        I am improvising over the following context: "{query}".

        Required JSON schema:
        {{
            "style": "Identified Style",
            "recommendedScales": ["Scale 1", "Scale 2"],
            "keyTargetNotes": ["Note1", "Note2"],
            "tips": ["Tip 1", "Tip 2"],
            "backingTrackSearch": "Youtube search query"
        }}
        """
        return await self._generate_json(prompt)

    async def generate_lyrics(self, topic: str, genre: str, mood: str) -> dict:
        prompt = f"""
        Write original song lyrics.
        Topic: {topic}, Genre: {genre}, Mood: {mood}
        
        Include suggested chord changes in brackets [ ] at the start of key lines.

        Required JSON schema:
        {{
            "title": "Creative Title",
            "structure": ["Verse 1", "Chorus", "Verse 2"],
            "lyrics": "Verse 1:\\n[G] Line of lyrics...\\n[C] Line of lyrics...\\n\\nChorus:\\n[D] Chorus line..."
        }}
        """
        return await self._generate_json(prompt)

    async def get_practice_advice(self, sessions: list) -> dict:
        prompt = f"""
        Act as a practice coach. Analyze these past sessions: {json.dumps(sessions)}.

        Required JSON schema:
        {{
            "insight": "Observation about consistency or focus",
            "recommendation": "Specific actionable tip",
            "focusArea": "Technical area to improve"
        }}
        """
        return await self._generate_json(prompt)


# Singleton instance
gemini_music_service = GeminiMusicService()