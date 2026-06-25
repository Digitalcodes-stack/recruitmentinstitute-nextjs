import asyncio
import httpx
from app.core.config import settings

async def main():
    # Login to get token
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        resp = await client.post("/api/v1/auth/login", data={"username": "student1@example.com", "password": "password123"})
        if resp.status_code != 200:
            print("Login failed:", resp.text)
            return
        token = resp.json()["access_token"]
        
        # Call report run-now
        headers = {"Authorization": f"Bearer {token}"}
        # In screenshot, the URL is /profile/assessments/13
        # Let's try to hit /api/v1/assessment/report/13/run-now
        resp = await client.post("/api/v1/assessment/report/13/run-now", headers=headers)
        print("Status:", resp.status_code)
        print("Response:", resp.text)

asyncio.run(main())
