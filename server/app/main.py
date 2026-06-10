from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ai

app = FastAPI()

# Allow frontend requests
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "https://ai-music-store.onrender.com",
    "https://ai-music-store.onrender.com/",
    "https://ai-music-store-wjnh.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],                  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ai.router)

# --- YOUR PRINT STATEMENTS ---
@app.on_event("startup")
async def startup_event():
    print("FastAPI app is starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    print("FastAPI app is shutting down...")

@app.get("/")
async def root():
    return {"message": "Chord Progression API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running successfully", "version": "2.6.0"}

@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working!"}
@app.get("/api-info")
async def api_info():
    return {
        "name": "Nexus AI Music Studio API",
        "version": "2.6.0",
        "endpoints": ["/ai/chords", "/ai/melody", "/ai/lyrics", "/ai/lesson", "/ai/status"],
    }
