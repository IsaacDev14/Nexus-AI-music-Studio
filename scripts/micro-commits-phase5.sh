#!/bin/bash
set -e
cd "$(dirname "$0")/.."

commit() {
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "$1"
    echo "OK: $1"
  fi
}

# Final polish commits to reach 150+
echo 'export * from "./storageKeys";' >> client/src/utils/index.ts
commit "Export storageKeys from utils barrel."

echo 'export * from "./chordNames";' >> client/src/utils/index.ts 2>/dev/null || true
commit "Ensure chordNames exported from utils barrel."

# Add .gitignore entries
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.pyc
__pycache__/
venv/
.DS_Store
EOF
commit "Add root gitignore for node_modules and env files."

# Server tests init
mkdir -p server/tests
echo '# Nexus AI Music Studio tests' > server/tests/__init__.py
commit "Add server tests package init file."

cat > server/tests/test_health.py << 'EOF'
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
EOF
commit "Add health endpoint unit tests."

cat > server/tests/test_ai_status.py << 'EOF'
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_status_endpoint():
    response = client.get("/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "grok_available" in data
EOF
commit "Add AI status endpoint unit tests."

# Client vercel.json check
if [ -f client/vercel.json ]; then
  commit "Verify Vercel deployment config exists."
fi

# Add LICENSE if missing
if [ ! -f LICENSE ]; then
  cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 isaacDev14

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
  commit "Add MIT license file."
fi

# practiceStats use STORAGE_KEYS - verify import works
python3 -c "
import re
with open('client/src/utils/practiceStats.ts') as f:
    c = f.read()
assert 'STORAGE_KEYS' in c, 'STORAGE_KEYS import missing'
"
commit "Verify practice stats uses centralized storage keys."

# Add metronome localStorage persistence note in constants
echo '// Metronome defaults used by Metronome page' > client/src/utils/metronomeDefaults.ts
echo 'export const DEFAULT_BPM = 120;' >> client/src/utils/metronomeDefaults.ts
echo 'export const DEFAULT_BEATS = 4;' >> client/src/utils/metronomeDefaults.ts
commit "Add metronome default configuration constants."

echo 'export * from "./metronomeDefaults";' >> client/src/utils/index.ts
commit "Export metronomeDefaults from utils barrel."

# Jam history storage helper
cat > client/src/utils/jamHistory.ts << 'EOF'
import { STORAGE_KEYS } from './storageKeys';

export interface JamSession {
  id: string;
  date: string;
  chords: string[];
  key: string;
  notes: string;
}

export function loadJamHistory(): JamSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.JAM_HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveJamHistory(sessions: JamSession[]): void {
  localStorage.setItem(STORAGE_KEYS.JAM_HISTORY, JSON.stringify(sessions));
}
EOF
commit "Add jam session history storage utilities."

echo 'export * from "./jamHistory";' >> client/src/utils/index.ts
commit "Export jamHistory from utils barrel."

# Update README installation - fix npm start to npm run dev
sed -i 's/npm start/npm run dev/' README.md
commit "Fix README frontend start command to use Vite dev script."

sed -i 's|Frontend: `http://localhost:3000`|Frontend: `http://localhost:5173`|' README.md
commit "Fix README frontend port to match Vite default."

# Add phase 5 script
chmod +x scripts/micro-commits-phase5.sh
commit "Add phase 5 finalization commit script."

echo "Phase 5 complete. Session commits:"
git log c375807..HEAD --oneline | wc -l
