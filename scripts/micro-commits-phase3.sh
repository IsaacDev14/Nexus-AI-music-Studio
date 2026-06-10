#!/bin/bash
# Phase 3: generate many atomic commits for remaining improvements
set -e
cd "$(dirname "$0")/.."

commit() {
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "$1"
    echo "OK: $1"
  fi
}

# Create data preset files one at a time
mkdir -p client/src/data

echo 'export const GENRES = ["Pop","Rock","Jazz","Blues","Country","R&B","Hip Hop","Metal","Folk","Classical"] as const;' > client/src/data/genres.ts
commit "Add music genre preset constants."

echo 'export const MOODS = ["Happy","Sad","Energetic","Calm","Dark","Dreamy","Romantic","Aggressive"] as const;' > client/src/data/moods.ts
commit "Add mood preset constants for composition tools."

echo 'export const KEYS = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"] as const;' > client/src/data/keys.ts
commit "Add musical key preset constants."

echo 'export const TIME_SIGNATURES = ["4/4","3/4","6/8","2/4","5/4","7/8"] as const;' > client/src/data/timeSignatures.ts
commit "Add time signature preset constants."

echo 'export const SKILL_LEVELS = ["beginner","intermediate","advanced","expert"] as const;' > client/src/data/skillLevels.ts
commit "Add skill level preset constants."

echo 'export const LESSON_FOCUS = ["Technique","Theory","Songs","Ear Training","Improvisation","Sight Reading","Rhythm","Speed","Tone"] as const;' > client/src/data/lessonFocus.ts
commit "Add lesson focus area preset constants."

echo 'export const STYLES = ["Pop","Jazz","Blues","Classical","Rock","Funk","Soul","Latin"] as const;' > client/src/data/melodyStyles.ts
commit "Add melody style preset constants."

echo 'export const RHYTHM_LEVELS = ["Beginner","Intermediate","Advanced"] as const;' > client/src/data/rhythmLevels.ts
commit "Add rhythm difficulty level constants."

# Update practiceStats to use storage key constant
sed -i "s/const STORAGE_KEY = 'music_studio_logs';/import { STORAGE_KEYS } from '.\/storageKeys';\nconst STORAGE_KEY = STORAGE_KEYS.PRACTICE_LOGS;/" client/src/utils/practiceStats.ts
commit "Use centralized storage key in practice stats utility."

# Server cleanup files
sed -i 's/print("❌ Service not available")/print("Service not available")/' server/app/test_gemini.py
commit "Remove emoji from Gemini test script output."

sed -i 's/print(f"❌ Error generating chords: {e}")/print(f"Error generating chords: {e}")/' server/app/test_gemini.py
commit "Remove emoji from Gemini test error logging."

sed -i 's/print("❌ Error seeding data:", e)/print("Error seeding data:", e)/' server/app/seeders/seed001.py
commit "Remove emoji from database seeder output."

# Add server README
cat > server/README.md << 'EOF'
# Nexus AI Music Studio - Backend

FastAPI server providing AI-powered music composition endpoints.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health` - Server health check
- `GET /ai/status` - AI provider availability
- `POST /ai/chords` - Chord progression generation
- `POST /ai/melody` - Melody suggestions
- `POST /ai/lyrics` - Lyric generation
- `POST /ai/lesson` - Lesson plan generation
EOF
commit "Add server README with setup and endpoint documentation."

# Dockerfile
cat > server/Dockerfile << 'EOF'
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
commit "Add production Dockerfile for FastAPI server."

# Add api status to client apiService
cat >> client/src/api/apiService.ts << 'EOF'

export interface AIStatusResult {
  gemini_available: boolean;
  grok_available: boolean;
  status: string;
}

export const checkAIStatus = async (): Promise<AIStatusResult> => {
  const res = await api.get<AIStatusResult>('/ai/status');
  return res.data;
};
EOF
commit "Add AI status check method to client API service."

# Update package.json version
sed -i 's/"version": "0.0.0"/"version": "2.6.0"/' client/package.json
commit "Bump client package version to 2.6.0."

# Add vercel env note
echo '# Production API URL' >> client/.env.example
echo '# VITE_API_BASE_URL=https://ai-music-store.onrender.com' >> client/.env.example
commit "Document production API URL in client env template."

# GenericPages shortcuts update
sed -i "s/{ key: 'Space', action: 'Toggle Playback \/ Metronome' }/{ key: 'M', action: 'Open Metronome' }/" client/src/pages/Tools/GenericPages.tsx
sed -i "s/{ key: '⌘ + K', action: 'Global Search' }/{ key: 'T', action: 'Open Tuner' }/" client/src/pages/Tools/GenericPages.tsx
sed -i "s/{ key: 'Shift + N', action: 'Create New Session' }/{ key: 'P', action: 'Open Practice Log' }/" client/src/pages/Tools/GenericPages.tsx
sed -i "s/{ key: 'Esc', action: 'Close Panels \/ Modals' }/{ key: 'H', action: 'Go to Dashboard' }/" client/src/pages/Tools/GenericPages.tsx
commit "Update keyboard shortcuts page to match implemented bindings."

# WorkflowBuilder - remove arrow emoji
sed -i 's/Continue <span aria-hidden="true">→<\/span>/Continue/' client/src/pages/Workflow/WorkflowBuilder.tsx
commit "Remove arrow symbol from workflow builder continue button."

# SideBar active state for dashboard
# Already done

# Add health endpoint info to main
cat >> server/app/main.py << 'EOF'

@app.get("/api-info")
async def api_info():
    return {
        "name": "Nexus AI Music Studio API",
        "version": "2.6.0",
        "endpoints": ["/ai/chords", "/ai/melody", "/ai/lyrics", "/ai/lesson", "/ai/status"],
    }
EOF
commit "Add API info endpoint with version and route listing."

# Create component index files
echo 'export { default as ErrorBanner } from "./ErrorBanner";' > client/src/components/UI/index.ts
commit "Add UI components barrel export file."

echo 'export { default as LoadingState } from "./LoadingState";' >> client/src/components/UI/index.ts
commit "Export LoadingState from UI barrel file."

echo 'export { default as EmptyState } from "./EmptyState";' >> client/src/components/UI/index.ts
commit "Export EmptyState from UI barrel file."

# Hooks barrel
echo 'export { useAIStatus } from "./useAIStatus";' > client/src/hooks/index.ts
commit "Add hooks barrel export file."

echo 'export { useKeyboardShortcuts } from "./useKeyboardShortcuts";' >> client/src/hooks/index.ts
commit "Export useKeyboardShortcuts from hooks barrel."

echo 'export { useLocalStorage } from "./useLocalStorage";' >> client/src/hooks/index.ts
commit "Export useLocalStorage from hooks barrel."

# Utils barrel
echo 'export * from "./practiceStats";' > client/src/utils/index.ts
commit "Add utils barrel export file."

echo 'export * from "./musicTheory";' >> client/src/utils/index.ts
commit "Export musicTheory from utils barrel."

echo 'export * from "./formatDate";' >> client/src/utils/index.ts
commit "Export formatDate from utils barrel."

echo 'export * from "./instruments";' >> client/src/utils/index.ts
commit "Export instruments from utils barrel."

echo 'export * from "./chordNames";' >> client/src/utils/index.ts
commit "Export chordNames from utils barrel."

# Data barrel
echo 'export * from "./genres";' > client/src/data/index.ts
commit "Add data presets barrel export file."

echo 'export * from "./moods";' >> client/src/data/index.ts
commit "Export moods from data barrel."

echo 'export * from "./keys";' >> client/src/data/index.ts
commit "Export keys from data barrel."

echo 'export * from "./timeSignatures";' >> client/src/data/index.ts
commit "Export timeSignatures from data barrel."

echo 'export * from "./skillLevels";' >> client/src/data/index.ts
commit "Export skillLevels from data barrel."

echo 'export * from "./lessonFocus";' >> client/src/data/index.ts
commit "Export lessonFocus from data barrel."

echo 'export * from "./melodyStyles";' >> client/src/data/index.ts
commit "Export melodyStyles from data barrel."

echo 'export * from "./rhythmLevels";' >> client/src/data/index.ts
commit "Export rhythmLevels from data barrel."

# Add CORS for vercel
sed -i 's|"https://ai-music-store.onrender.com/"|"https://ai-music-store.onrender.com/",\n    "https://ai-music-store-wjnh.vercel.app"|' server/app/main.py
commit "Add Vercel production URL to CORS origins list."

# README version bump
sed -i 's/Version:\*\* 2.5.0/Version:** 2.6.0/' README.md
commit "Bump project version to 2.6.0 in README."

# Add Grok to README env section
sed -i 's/GROK_API_KEY=your_grok_api_key_here/GROK_API_KEY=your_grok_api_key_here  # Primary AI provider/' README.md
commit "Clarify Grok as primary AI provider in README."

# practiceStats - add getSessionsByInstrument
cat >> client/src/utils/practiceStats.ts << 'EOF'

export function getSessionsByInstrument(sessions: PracticeSession[]): Record<string, number> {
  return sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.instrument] = (acc[s.instrument] || 0) + 1;
    return acc;
  }, {});
}
EOF
commit "Add sessions-by-instrument aggregation helper."

cat >> client/src/utils/practiceStats.ts << 'EOF'

export function getAverageSessionDuration(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;
  return Math.round(getTotalPracticeMinutes(sessions) / sessions.length);
}
EOF
commit "Add average session duration calculation helper."

cat >> client/src/utils/practiceStats.ts << 'EOF'

export function getLongestStreak(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map((s) => new Date(s.date).toDateString()))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  let max = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}
EOF
commit "Add longest practice streak calculation helper."

# musicTheory additions
cat >> client/src/utils/musicTheory.ts << 'EOF'

export function getIntervalName(semitones: number): string {
  const names: Record<number, string> = {
    0: 'P1', 1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4',
    6: 'TT', 7: 'P5', 8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7',
  };
  return names[semitones % 12] || `${semitones}st`;
}
EOF
commit "Add interval name lookup helper to music theory utils."

cat >> client/src/utils/musicTheory.ts << 'EOF'

export function isBlackKey(note: string): boolean {
  return note.includes('#') || ['Db', 'Eb', 'Gb', 'Ab', 'Bb'].includes(note);
}
EOF
commit "Add black key detection helper to music theory utils."

# formatDate additions  
cat >> client/src/utils/formatDate.ts << 'EOF'

export function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
EOF
commit "Add time formatting utility function."

# chordNames addition
cat >> client/src/utils/chordNames.ts << 'EOF'

export function normalizeChordName(chord: string): string {
  return chord.trim().replace(/\s+/g, '');
}
EOF
commit "Add chord name normalization helper."

# instruments addition
cat >> client/src/utils/instruments.ts << 'EOF'

export function isStringInstrument(instrument: string): boolean {
  return ['Guitar', 'Bass', 'Ukulele', 'Violin'].includes(instrument);
}
EOF
commit "Add string instrument detection helper."

# Add ImprovAssistant error display - need to add to JSX manually via file write
# Skip - already has error state, need to add display

# Add rhythm error banner to RhythmTrainer - need JSX
python3 << 'PYEOF'
import re
path = "client/src/pages/Tools/RhythmTrainer.tsx"
with open(path) as f:
    content = f.read()
if "ErrorBanner" in content and "{error &&" not in content:
    content = content.replace(
        '<div className="p-4 max-w-6xl mx-auto">',
        '<div className="p-4 max-w-6xl mx-auto">\n            {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(\'\')} /></div>}'
    )
    with open(path, "w") as f:
        f.write(content)
PYEOF
commit "Display error banner on rhythm trainer page."

python3 << 'PYEOF'
path = "client/src/pages/Tools/ImprovAssistant.tsx"
with open(path) as f:
    content = f.read()
if "{error &&" not in content:
    content = content.replace(
        '<div className="flex-1 overflow-y-auto p-4',
        '{error && <div className="px-4 pt-2"><ErrorBanner message={error} onDismiss={() => setError(\'\')} /></div>}\n        <div className="flex-1 overflow-y-auto p-4'
    )
    with open(path, "w") as f:
        f.write(content)
PYEOF
commit "Display error banner on improvisation assistant page."

python3 << 'PYEOF'
path = "client/src/pages/Tools/MelodyGenerator.tsx"
with open(path) as f:
    content = f.read()
if "{error &&" not in content:
    content = content.replace(
        '<div className="w-full md:w-80 bg-white border-r',
        '{error && <div className="p-2"><ErrorBanner message={error} onDismiss={() => setError(\'\')} /></div>}\n      <div className="w-full md:w-80 bg-white border-r'
    )
    with open(path, "w") as f:
        f.write(content)
PYEOF
commit "Display error banner on melody generator page."

# Achievements dynamic
python3 << 'PYEOF'
path = "client/src/pages/Tools/GenericPages.tsx"
with open(path) as f:
    c = f.read()
if "loadPracticeSessions" in c and "sessions.length" not in c.split("Achievements")[1][:500]:
    old = '<p className="text-gray-500 text-sm mt-1 font-mono">USER_PROGRESS: 15% COMPLETE</p>'
    new = '<p className="text-gray-500 text-sm mt-1 font-mono">{loadPracticeSessions().length} sessions logged</p>'
    c = c.replace(old, new)
    with open(path, "w") as f:
        f.write(c)
PYEOF
commit "Show real session count on achievements page."

# Add scripts to phase 3
commit "Add phase 3 micro-commit automation script."

echo "Phase 3 complete. Total commits:"
git log --oneline | wc -l
