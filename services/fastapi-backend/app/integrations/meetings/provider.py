from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime


@dataclass
class MeetingProviderResult:
    external_meeting_id: str | None
    meeting_url: str | None


class MeetingProvider(ABC):
    @abstractmethod
    async def create(self, title: str, start_time: datetime, end_time: datetime, description: str | None = None) -> MeetingProviderResult:
        raise NotImplementedError

    @abstractmethod
    async def update(self, external_meeting_id: str, title: str, start_time: datetime, end_time: datetime, description: str | None = None) -> MeetingProviderResult:
        raise NotImplementedError

    @abstractmethod
    async def cancel(self, external_meeting_id: str) -> None:
        raise NotImplementedError

