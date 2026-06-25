import json
import logging
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore

logger = logging.getLogger(__name__)

class MockProvider(AIProvider):
    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        logger.info(f"MockProvider generating {count} questions")
        questions = []
        for i in range(count):
            questions.append({
                "question_type": "multiple_choice",
                "topic": "General Mock Knowledge",
                "question_text": f"This is a mock question {i + 1}?",
                "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
                "correct_answer": "A"
            })
        return questions

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        logger.info("MockProvider analyzing performance")
        strong_topics = [ts.topic_name for ts in topic_scores if ts.percentage >= 70]
        weak_topics = [ts.topic_name for ts in topic_scores if ts.percentage < 70]
        
        if not strong_topics and not weak_topics:
            strong_topics = ["General Knowledge"]
            weak_topics = ["Advanced Topics"]
            
        return PerformanceAnalysis(
            strong_topics=strong_topics,
            weak_topics=weak_topics,
            difficulty_breakdown={"basic": 80.0, "intermediate": 60.0, "advanced": 40.0},
            summary=f"You scored {percentage}%. This is a mocked AI analysis since no API key is configured."
        )

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        logger.info(f"MockProvider generating notes for {topic_name}")
        return f"### Mock Notes for {topic_name}\n\nThis is placeholder text because no AI API key is configured. In a real environment, this would contain a detailed, personalized breakdown of `{topic_name}`.\n\n- Key Point 1\n- Key Point 2"

    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str]) -> dict:
        logger.info("MockProvider generating study plan")
        return {
            "daily_schedule": [
                {"day": "Day 1", "topic": weak_topics[0] if weak_topics else "General", "activity": "Review Mock Notes"}
            ],
            "recommended_resources": ["https://example.com/mock-resource"]
        }

    async def generate_recommendations(self, percentage: float) -> list[str]:
        logger.info("MockProvider generating recommendations")
        return [
            "Review your mock notes thoroughly.",
            "Configure an AI Provider API Key in the `.env` file to see real AI feedback!"
        ]

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        return ["Monitor student mock progress", "Configure AI API keys for real insights"]
