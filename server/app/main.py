# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.routers import users, instruments, lessons, songs, ai

app = FastAPI(title="AI Music Studio API")

# Allow CORS for frontend development (adjust origins as needed)
origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(instruments.router, prefix="/instruments", tags=["Instruments"])
app.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
app.include_router(songs.router, prefix="/songs", tags=["Songs"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])

@app.get("/")
def root():
    return {"message": "Welcome to AI Music Studio API!"}
