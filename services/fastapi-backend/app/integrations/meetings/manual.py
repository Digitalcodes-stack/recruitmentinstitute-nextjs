from datetime import datetime

from app.integrations.meetings.provider import MeetingProvider, MeetingProviderResult


class ManualMeetingProvider(MeetingProvider):
    async def create(self, title: str, start_time: datetime, end_time: datetime, description: str | None = None) -> MeetingProviderResult:
        return MeetingProviderResult(external_meeting_id=None, meeting_url=None)

    async def update(self, external_meeting_id: str, title: str, start_time: datetime, end_time: datetime, description: str | None = None) -> MeetingProviderResult:
        return MeetingProviderResult(external_meeting_id=external_meeting_id, meeting_url=None)

    async def cancel(self, external_meeting_id: str) -> None:
        return None

