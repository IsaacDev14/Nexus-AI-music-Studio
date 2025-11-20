# Nexus AI Music Studio

**Version:** 2.5.0
**Tech Stack:** React | TypeScript | Tailwind CSS | Python FastAPI | PostgreSQL
**AI Integration:** Google Gemini 2.5 Flash, Grok API
**License:** MIT

---

## Overview

Nexus AI Music Studio is a fully integrated music practice and composition platform designed for musicians of all skill levels. It combines a modern React frontend with a robust Python FastAPI backend, PostgreSQL database, and AI services to create a professional, interactive environment for learning, practicing, and composing music.

The platform features a professional audio lab-style interface, offering intuitive tools for both real-time practice and AI-assisted composition.

**Screenshots:**
![alt text](client/src/assets/images/home.png)

---

## Key Features

### Precision Audio Tools

* **Spectral Tuner:** High-precision real-time pitch detection using auto-correlation algorithms with visual oscilloscope.
* **Signal Generator X-1 (Calibration):** Supports sine, square, sawtooth, and triangle waves for calibration purposes.
* **Vintage Metronome:** Drift-free scheduling using Web Audio API for accurate rhythm training.
* **Rhythm Trainer:** AI-generated patterns for sight-reading exercises.

**Screenshots:**
![alt text](client/src/assets/images/metronome.png)

### AI Composition Suite

* **Chord Progression Engine:** Generates complex chord sequences with harmonic analysis and inline SVG visualizations.
* **Melody Spark:** AI-driven motif generator visualized in a scrolling piano roll editor.
* **Improv Coach:** Contextual guidance for scales, modes, and techniques during live play.
* **Lyricist & Songwriter:** Generates structured lyrics with chord placement suggestions.
* **Backing Track Generator:** JSON-based sequencer for real-time audio loops.

**Screenshots:**
![alt text](client/src/assets/images/chordp.png)

### Education & Practice

* **Smart Lesson Planner:** Generates personalized lessons based on instrument and skill level.
* **Ear Training Module:** Interactive interval recognition with AI-powered hints.
* **Practice Log & Analytics:** Tracks practice duration, streaks, and skill progression.


---

## Backend Architecture

* **Framework:** Python FastAPI
* **Database:** PostgreSQL with SQLAlchemy ORM
* **Authentication:** JWT-based authentication and secure API endpoints
* **AI Services:**

  * Google Gemini API for intelligent composition suggestions
  * Grok API for natural language understanding and AI prompts
* **Other Services:** Audio analysis and song data handled by custom Python services

**API Endpoints Overview:**

* `/api/ai` - AI composition and lesson planning
* `/api/auth` - User authentication and management
* `/api/instruments` - Instrument and tuning data
* `/api/lessons` - Lesson planning and progress tracking
* `/api/songs` - Song management and metadata
* `/api/users` - User profiles and practice history


---

## Technical Stack

### Frontend

* React 19, TypeScript
* Tailwind CSS with custom themes
* React Router v7
* Heroicons

### Backend

* Python 3.13 with FastAPI
* PostgreSQL for relational data
* SQLAlchemy ORM
* Alembic migrations
* JWT-based authentication and secure endpoints

### Audio Engine

* Web Audio API for real-time audio processing
* AudioContext, AnalyserNode, OscillatorNode, and MediaStreamSource

### AI Integration

* Google Gemini API for structured composition outputs
* Grok API for natural language processing and interactive assistant features

---

## Installation & Setup

1. **Clone the repository:**

```bash
git clone https://github.com/isaacDev14/ai-music-studio.git
cd ai-music-studio
```

2. **Frontend Setup:**

```bash
cd client
npm install
npm start
```

3. **Backend Setup:**

```bash
cd server
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. **Environment Variables:**

```env
REACT_APP_API_KEY=your_gemini_api_key_here
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL=postgresql://username:password@localhost/db_name
```

5. **Database Setup:**

```bash
alembic upgrade head
```

6. **Access Application:**

* Frontend: `http://localhost:3000`
* Backend: `http://127.0.0.1:8000`

---

## Project Structure

```
client/  # React frontend
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   └── types/

server/  # Python FastAPI backend
├── app/
│   ├── api/         # Gemini, Grok, Audd services
│   ├── routers/     # API endpoint routers
│   ├── seeders/     # Initial data population scripts
│   ├── config.py    # Configuration variables
│   ├── database.py  # PostgreSQL connection and session management
│   ├── models.py    # ORM models
│   ├── schemas.py   # Pydantic schemas
│   └── main.py      # FastAPI app instantiation
```


## Technical Highlights

* **High-Precision Audio:** Auto-correlation pitch detection and lookahead metronome scheduling.
* **AI-Driven Composition:** Gemini API generates structured melodies, chords, and lesson plans.
* **Interactive Assistant:** Grok API provides natural language support and guidance.
* **Scalable Backend:** FastAPI + PostgreSQL architecture supports concurrent users and rapid iteration.
* **Low Latency Performance:** Real-time audio feedback with minimal delay across tools.

---

## Contributing

Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit changes with meaningful messages
4. Push to the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

**Author:** [isaacDev14](https://github.com/isaacDev14)
**Live Demo:** [https://ai-music-store-wjnh.vercel.app/](https://ai-music-store-wjnh.vercel.app/)
**Repository:** [https://github.com/isaacDev14/ai-music-studio](https://github.com/isaacDev14/ai-music-studio)


