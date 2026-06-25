from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class TopicScore:
    topic_name: str
    correct: int
    total: int
    percentage: float


@dataclass
class PerformanceAnalysis:
    strong_topics: list[str] = field(default_factory=list)
    weak_topics: list[str] = field(default_factory=list)
    difficulty_breakdown: dict[str, float] = field(default_factory=dict)
    summary: str = ""


class AIProvider(ABC):
    @abstractmethod
    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        raise NotImplementedError

    @abstractmethod
    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str]) -> dict:
        raise NotImplementedError

    @abstractmethod
    async def generate_recommendations(self, percentage: float) -> list[str]:
        raise NotImplementedError

    @abstractmethod
    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        raise NotImplementedError
