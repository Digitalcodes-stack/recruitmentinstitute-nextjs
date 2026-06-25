from app.core.config import settings
from app.integrations.meetings.google import GoogleMeetProvider
from app.integrations.meetings.manual import ManualMeetingProvider
from app.integrations.meetings.provider import MeetingProvider


def get_meeting_provider() -> MeetingProvider:
    if settings.google_client_id and settings.google_client_secret and settings.google_refresh_token:
        return GoogleMeetProvider()
    return ManualMeetingProvider()
