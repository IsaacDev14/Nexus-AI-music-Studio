const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5:generate";

export interface ChordProgressionRequest {
  songQuery: string;
  simplify: boolean;
  helpPractice: boolean;
  showSubstitutions: boolean;
}

export interface Chord {
  chord: string;
  duration: number;
}

export interface Substitution {
  originalChord: string;
  substitutedChord: string;
  theory: string;
}

export interface ChordProgression {
  songTitle: string;
  artist: string;
  key: string;
  progression: Chord[];
  substitutions: Substitution[];
  practiceTips: string[];
}

interface ParsedResponse {
  songTitle?: string;
  artist?: string;
  key?: string;
  progression?: Chord[];
  substitutions?: Substitution[];
  practiceTips?: string[];
}

export const generateChordProgression = async (
  request: ChordProgressionRequest
): Promise<ChordProgression> => {
  const prompt = `
You are a world-class music theory teacher and professional guitarist.

Analyze the song "${request.songQuery}" and return ONLY valid JSON (no explanations) with this structure:

{
  "songTitle": "Exact song title",
  "artist": "Artist name",
  "key": "e.g. C Major or A Minor",
  "progression": [{"chord": "C", "duration": 4}],
  "substitutions": [],
  "practiceTips": []
}

Rules:
- Use standard chord notation (C, Am, G7, Fmaj7, etc.)
- Durations must be realistic (2, 4, or 8 beats)
- ${request.simplify ? "Use simple open chords only" : "Use richer voicings"}
- JSON ONLY. No comments, no markdown.
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Invalid JSON returned from Gemini");
  }

  const parsed: ParsedResponse = JSON.parse(jsonMatch[0]);

  return {
    songTitle: parsed.songTitle || request.songQuery,
    artist: parsed.artist || "Unknown Artist",
    key: parsed.key || "C Major",
    progression: parsed.progression ?? [],
    substitutions: parsed.substitutions ?? [],
    practiceTips: parsed.practiceTips ?? [],
  };
};
