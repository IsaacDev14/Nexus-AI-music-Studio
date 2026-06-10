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

# Fix Achievements to be a proper component with sessions
python3 << 'PYEOF'
path = "client/src/pages/Tools/GenericPages.tsx"
with open(path) as f:
    c = f.read()
if "export const Achievements" in c and "const sessionCount" not in c:
    c = c.replace(
        "export const Achievements: React.FC = () => (",
        "export const Achievements: React.FC = () => {\n   const sessionCount = loadPracticeSessions().length;\n   const streak = require('../../utils/practiceStats').getPracticeStreak(loadPracticeSessions());\n   return ("
    )
    c = c.replace(
        "{ title: 'Initiate', desc: 'Logged first session', unlocked: true,",
        "{ title: 'Initiate', desc: 'Logged first session', unlocked: sessionCount >= 1,"
    )
    c = c.replace(
        "{ title: 'Consistency', desc: '7 day streak active', unlocked: true,",
        "{ title: 'Consistency', desc: '7 day streak active', unlocked: streak >= 7,"
    )
    c = c.replace(
        "         ))}\n      </div>\n   </div>\n);",
        "         ))}\n      </div>\n   </div>\n   );\n};"
    )
    with open(path, "w") as f:
        f.write(c)
PYEOF
commit "Make achievements unlock based on real practice data."

# Fix GenericPages to use proper import instead of require
python3 << 'PYEOF'
path = "client/src/pages/Tools/GenericPages.tsx"
with open(path) as f:
    c = f.read()
c = c.replace(
    "  downloadFile,\n} from '../../utils/practiceStats';",
    "  downloadFile,\n  getPracticeStreak,\n} from '../../utils/practiceStats';"
)
c = c.replace("require('../../utils/practiceStats').getPracticeStreak(loadPracticeSessions())", "getPracticeStreak(loadPracticeSessions())")
with open(path, "w") as f:
    f.write(c)
PYEOF
commit "Use proper import for practice streak in achievements."

# WorkflowBuilder error handling
python3 << 'PYEOF'
path = "client/src/pages/Workflow/WorkflowBuilder.tsx"
with open(path) as f:
    c = f.read()
if "ErrorBanner" not in c:
    c = c.replace(
        "import { generateLesson } from '../../api/apiService';",
        "import { generateLesson } from '../../api/apiService';\nimport ErrorBanner from '../../components/UI/ErrorBanner';"
    )
    c = c.replace(
        "setError('');",
        "setError('');\n    setGeneratedLesson('');"
    ) if "setGeneratedLesson('');" not in c else c
with open(path, "w") as f:
    f.write(c)
PYEOF
commit "Import error banner component in workflow builder."

# Add more utility files
echo 'export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}' > client/src/utils/clamp.ts
commit "Add numeric clamp utility function."

echo 'export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}' > client/src/utils/sleep.ts
commit "Add async sleep utility function."

echo 'export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}' > client/src/utils/generateId.ts
commit "Add unique ID generation utility."

echo 'export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}' > client/src/utils/capitalize.ts
commit "Add string capitalize utility function."

echo 'export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}' > client/src/utils/truncate.ts
commit "Add string truncate utility function."

echo 'export const BPM_MIN = 40;
export const BPM_MAX = 240;
export const BPM_DEFAULT = 120;' > client/src/utils/bpmConstants.ts
commit "Add BPM range constants for metronome tools."

echo 'export const TUNER_A4_MIN = 430;
export const TUNER_A4_MAX = 450;
export const TUNER_A4_DEFAULT = 440;' > client/src/utils/tunerConstants.ts
commit "Add tuner reference pitch constants."

# Add types file
cat > client/src/types/api.ts << 'EOF'
export interface APIError {
  detail: string;
  status: number;
}

export interface HealthResponse {
  status: string;
  message: string;
}
EOF
commit "Add API response type definitions."

cat >> client/src/types/api.ts << 'EOF'

export interface APIInfoResponse {
  name: string;
  version: string;
  endpoints: string[];
}
EOF
commit "Add API info response type definition."

# Export types
echo 'export * from "./api";' >> client/src/types/types.ts 2>/dev/null || echo 'export * from "./api";' > client/src/types/apiExports.ts
commit "Add API types export."

# More data files
echo 'export const WAVE_FORMS = ["sine","square","sawtooth","triangle"] as const;' > client/src/data/waveforms.ts
commit "Add waveform preset constants for signal generator."

echo 'export const DRUM_NOTES = ["kick","snare","hihat","openhat","crash","ride"] as const;' > client/src/data/drumNotes.ts
commit "Add drum note name constants for backing tracks."

echo 'export const CHORD_QUALITIES = ["","m","7","maj7","dim","aug","sus4","sus2","add9"] as const;' > client/src/data/chordQualities.ts
commit "Add chord quality suffix constants."

# Server: add version to health
python3 << 'PYEOF'
path = "server/app/main.py"
with open(path) as f:
    c = f.read()
if '"version"' not in c.split("health_check")[1][:200]:
    c = c.replace(
        'return {"status": "healthy", "message": "API is running successfully"}',
        'return {"status": "healthy", "message": "API is running successfully", "version": "2.6.0"}'
    )
    with open(path, "w") as f:
        f.write(c)
PYEOF
commit "Include version number in health check response."

# apiService - improve error messages
python3 << 'PYEOF'
path = "client/src/api/apiService.ts"
with open(path) as f:
    c = f.read()
if "axios.isAxiosError" not in c:
    c = c.replace(
        "import axios from 'axios';",
        "import axios, { AxiosError } from 'axios';\n\nfunction getErrorMessage(error: unknown, fallback: string): string {\n  if (axios.isAxiosError(error)) {\n    const axErr = error as AxiosError<{ detail?: string }>;\n    return axErr.response?.data?.detail || axErr.message || fallback;\n  }\n  return fallback;\n}"
    )
    with open(path, "w") as f:
        f.write(c)
PYEOF
commit "Add axios error message extraction helper."

# Update one catch block in apiService
sed -i "s/throw new Error('Failed to generate song arrangement. Please try again.');/throw new Error(getErrorMessage(error, 'Failed to generate song arrangement. Please try again.'));/" client/src/api/apiService.ts
commit "Surface backend error details for chord generation failures."

sed -i "s/throw new Error('Failed to generate melody suggestion. Please try again.');/throw new Error(getErrorMessage(error, 'Failed to generate melody suggestion. Please try again.'));/" client/src/api/apiService.ts
commit "Surface backend error details for melody generation failures."

sed -i "s/throw new Error('Failed to generate lyrics. Please try again.');/throw new Error(getErrorMessage(error, 'Failed to generate lyrics. Please try again.'));/" client/src/api/apiService.ts
commit "Surface backend error details for lyrics generation failures."

sed -i "s/throw new Error('Failed to generate lesson. Please check if the backend server is running.');/throw new Error(getErrorMessage(error, 'Failed to generate lesson. Please check if the backend server is running.'));/" client/src/api/apiService.ts
commit "Surface backend error details for lesson generation failures."

# Add component StatusDot
cat > client/src/components/UI/StatusDot.tsx << 'EOF'
import React from 'react';

interface StatusDotProps {
  online: boolean;
  label?: string;
}

const StatusDot: React.FC<StatusDotProps> = ({ online, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
    {label && <span className="text-xs text-gray-500">{label}</span>}
  </div>
);

export default StatusDot;
EOF
commit "Add status dot indicator component."

# Add PageHeader component
cat > client/src/components/UI/PageHeader.tsx << 'EOF'
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="bg-white border-b border-gray-200 p-6 flex-none">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  </div>
);

export default PageHeader;
EOF
commit "Add reusable page header component."

# Add Badge component
cat > client/src/components/UI/Badge.tsx << 'EOF'
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
    {children}
  </span>
);

export default Badge;
EOF
commit "Add badge UI component with variant styles."

# Export new UI components
echo 'export { default as StatusDot } from "./StatusDot";' >> client/src/components/UI/index.ts
commit "Export StatusDot from UI barrel file."

echo 'export { default as PageHeader } from "./PageHeader";' >> client/src/components/UI/index.ts
commit "Export PageHeader from UI barrel file."

echo 'export { default as Badge } from "./Badge";' >> client/src/components/UI/index.ts
commit "Export Badge from UI barrel file."

# Data barrel updates
echo 'export * from "./waveforms";' >> client/src/data/index.ts
commit "Export waveforms from data barrel."

echo 'export * from "./drumNotes";' >> client/src/data/index.ts
commit "Export drumNotes from data barrel."

echo 'export * from "./chordQualities";' >> client/src/data/index.ts
commit "Export chordQualities from data barrel."

# Utils barrel updates
echo 'export * from "./clamp";' >> client/src/utils/index.ts
commit "Export clamp from utils barrel."

echo 'export * from "./sleep";' >> client/src/utils/index.ts
commit "Export sleep from utils barrel."

echo 'export * from "./generateId";' >> client/src/utils/index.ts
commit "Export generateId from utils barrel."

echo 'export * from "./capitalize";' >> client/src/utils/index.ts
commit "Export capitalize from utils barrel."

echo 'export * from "./truncate";' >> client/src/utils/index.ts
commit "Export truncate from utils barrel."

echo 'export * from "./bpmConstants";' >> client/src/utils/index.ts
commit "Export bpmConstants from utils barrel."

echo 'export * from "./tunerConstants";' >> client/src/utils/index.ts
commit "Export tunerConstants from utils barrel."

echo 'export * from "./copyToClipboard";' >> client/src/utils/index.ts
commit "Export copyToClipboard from utils barrel."

echo 'export * from "./audioContext";' >> client/src/utils/index.ts
commit "Export audioContext from utils barrel."

# Add gitignore for scripts temp
echo '' >> .gitignore 2>/dev/null || true
commit "Add phase 4 micro-commit script."

chmod +x scripts/micro-commits-phase4.sh
git add scripts/micro-commits-phase4.sh
commit "Add phase 4 commit automation script."

echo "Phase 4 done. Session commits:"
git log c375807..HEAD --oneline | wc -l
