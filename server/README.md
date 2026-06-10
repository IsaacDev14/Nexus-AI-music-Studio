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
