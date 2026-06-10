import os
import httpx
from dotenv import load_dotenv

load_dotenv()
AUDD_API_KEY = os.getenv("AUDD_API_KEY")
AUDD_API_URL = "https://api.audd.io/"


class AuddService:
    def __init__(self):
        self.api_key = AUDD_API_KEY
        self.available = bool(self.api_key)

    async def identify_from_file(self, file_path: str) -> dict | None:
        if not self.available:
            return None

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                with open(file_path, "rb") as f:
                    files = {"file": (os.path.basename(file_path), f, "audio/wav")}
                    data = {
                        "api_token": self.api_key,
                        "return": "apple_music,spotify",
                    }
                    resp = await client.post(AUDD_API_URL, data=data, files=files)
                    resp.raise_for_status()
                    body = resp.json()

            if body.get("status") != "success" or not body.get("result"):
                return None

            result = body["result"]
            return {
                "title": result.get("title", "Unknown"),
                "artist": result.get("artist", "Unknown"),
                "album": result.get("album"),
                "release_date": result.get("release_date"),
            }
        except Exception as e:
            print(f"AudD identification failed: {e}")
            return None


audd_service = AuddService()
