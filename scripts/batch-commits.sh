#!/bin/bash
# Batch commit helper - commits staged files one at a time with custom messages
set -e
cd "$(dirname "$0")/.."

commit_file() {
  local file="$1"
  local msg="$2"
  if [ -f "$file" ] || [ -d "$file" ]; then
    git add "$file"
    if ! git diff --cached --quiet; then
      git commit -m "$msg"
      echo "Committed: $file"
    fi
  fi
}

# Client utilities
commit_file "client/src/utils/practiceStats.ts" "Add practice session stats and export utilities."
commit_file "client/src/utils/musicTheory.ts" "Add music theory helper functions for scales and notes."
commit_file "client/src/utils/formatDate.ts" "Add date and duration formatting utilities."
commit_file "client/src/utils/storageKeys.ts" "Centralize localStorage key constants."
commit_file "client/src/hooks/useAIStatus.ts" "Add hook to poll AI backend health status."
commit_file "client/src/hooks/useKeyboardShortcuts.ts" "Add global keyboard navigation shortcuts."
commit_file "client/src/hooks/useLocalStorage.ts" "Add reusable localStorage state hook."
commit_file "client/src/components/UI/ErrorBanner.tsx" "Add dismissible error banner component."
commit_file "client/src/components/UI/LoadingState.tsx" "Add reusable loading state component."
commit_file "client/src/components/UI/EmptyState.tsx" "Add empty state placeholder component."
commit_file "client/src/utils/constants.ts" "Fix dashboard path typo and add Dashboard route."
commit_file "client/src/pages/Dashboard.tsx" "Connect dashboard to real practice stats and AI status."
commit_file "client/src/App.tsx" "Add dashboard route and keyboard shortcut support."
commit_file "client/src/components/Layout/SideBar.tsx" "Add dashboard nav link and clean up branding."
commit_file "client/src/components/Layout/TopBar.tsx" "Show live AI status indicator in top bar."
commit_file "client/src/pages/Compose/ChordStudio.tsx" "Replace piano emoji with icon in chord visualizer."
commit_file "client/src/pages/Tools/PracticeLog.tsx" "Add session delete, streak stats, and error handling."
commit_file "client/src/pages/Tools/GenericPages.tsx" "Wire data export buttons to practice log download."
commit_file "client/src/pages/Tools/MelodyGenerator.tsx" "Add error handling for melody generation failures."
commit_file "client/src/index.css" "Add global animation and scrollbar utility classes."

echo "Batch commits complete."
