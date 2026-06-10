# app/config.py
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROK_API_KEY = os.getenv("GROK_API_KEY") or os.getenv("GROQ_API_KEY")
AUDD_API_KEY = os.getenv("AUDD_API_KEY")

FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
]

DEFAULT_CHORD_KEY = "C"
GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
GROK_MODELS = ["grok-2-1212", "grok-beta"]
