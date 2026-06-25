from datetime import datetime, timezone

import httpx

from app.core.config import settings
from app.core.exceptions import ServiceError
from app.integrations.meetings.provider import MeetingProvider, MeetingProviderResult


class GoogleMeetProvider(MeetingProvider):
    async def _get_access_token(self) -> str:
        if not settings.google_client_id or not settings.google_client_secret or not settings.google_refresh_token:
            raise ServiceError("Google Meet integration is not configured", 503)

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "refresh_token": settings.google_refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            if response.status_code >= 400:
                raise ServiceError("Unable to obtain Google access token", 503)
            token = response.json().get("access_token")
            if not token:
                raise ServiceError("Google access token missing", 503)
            return token

    async def create(self, title: str, start_time: datetime, end_time: datetime, description: str | None = None) -> MeetingProviderResult:
        access_token = await self._get_access_token()
        payload = {
            "summary": title,
            "description": description or "",
            "start": {"dateTime": start_time.astimezone(timezone.utc).isoformat()},
            "end": {"dateTime": end_time.astimezone(timezone.utc).isoformat()},
            "conferenceData": {
                "createRequest": {"requestId": f"{title}-{int(start_time.timestamp())}"}
            },
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"https://www.googleapis.com/calendar/v3/calendars/{settings.google_calendar_id}/events?conferenceDataVersion=1",
                json=payload,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code >= 400:
                raise ServiceError("Unable to create Google Meet event", 503)
            body = response.json()
            conference = body.get("conferenceData", {}).get("entryPoints", [])
            meeting_url = next((item.get("uri") for item in conference if item.get("entryPointType") == "video"), None)
            return MeetingProviderResult(external_meeting_id=body.get("id"), meeting_url=meeting_url or body.get("hangoutLink"))

    async def update(self, external_meeting_id: str, title: str, start_time: datetime, end_time: datetime, description: str | None = None) -> MeetingProviderResult:
        access_token = await self._get_access_token()
        payload = {
            "summary": title,
            "description": description or "",
            "start": {"dateTime": start_time.astimezone(timezone.utc).isoformat()},
            "end": {"dateTime": end_time.astimezone(timezone.utc).isoformat()},
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.patch(
                f"https://www.googleapis.com/calendar/v3/calendars/{settings.google_calendar_id}/events/{external_meeting_id}",
                json=payload,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code >= 400:
                raise ServiceError("Unable to update Google Meet event", 503)
            body = response.json()
            return MeetingProviderResult(external_meeting_id=body.get("id"), meeting_url=body.get("hangoutLink"))

    async def cancel(self, external_meeting_id: str) -> None:
        access_token = await self._get_access_token()
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.delete(
                f"https://www.googleapis.com/calendar/v3/calendars/{settings.google_calendar_id}/events/{external_meeting_id}",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code >= 400:
                raise ServiceError("Unable to cancel Google Meet event", 503)

