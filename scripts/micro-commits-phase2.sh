#!/bin/bash
set -e
cd "$(dirname "$0")/.."

commit_file() {
  local file="$1"
  local msg="$2"
  git add "$file"
  if ! git diff --cached --quiet; then
    git commit -m "$msg"
    echo "OK: $msg"
  fi
}

commit_file "client/src/pages/Tools/SongWriter.tsx" "Add error handling to AI songwriter page."
commit_file "client/src/pages/Tools/RhythmTrainer.tsx" "Add error handling and rename rhythm trainer header."
commit_file "client/src/pages/Tools/ImprovAssistant.tsx" "Add error handling to improvisation assistant."
commit_file "client/src/pages/Compose/ChordStudio.tsx" "Add error banners to chord studio search and compose."
commit_file "client/.env.example" "Add client environment variable template."
commit_file "client/src/utils/chordNames.ts" "Add chord name validation and common chord lists."
commit_file "client/src/utils/instruments.ts" "Add instrument list and tuning reference data."
commit_file "client/src/utils/audioContext.ts" "Add shared AudioContext utility for audio tools."
commit_file "client/src/utils/copyToClipboard.ts" "Add clipboard copy helper with fallback."
commit_file "scripts/batch-commits.sh" "Add batch commit helper script."

echo "Phase 2 complete."
