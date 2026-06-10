from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_status_endpoint():
    response = client.get("/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "grok_available" in data
