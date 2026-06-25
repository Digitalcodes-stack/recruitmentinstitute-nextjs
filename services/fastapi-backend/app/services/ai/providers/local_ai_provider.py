import asyncio

from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.question_generator import generate_questions_from_content

_STRONG_THRESHOLD = 70.0


class LocalAIProvider(AIProvider):
    """Fully offline AIProvider: rule-based analysis/recommendations/study
    plans, local transformers summarization for notes, local NLP-based
    question generation. No network calls, no API keys."""

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        return await asyncio.to_thread(generate_questions_from_content, context_text, question_types, count)

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        strong_topics = [t.topic_name for t in topic_scores if t.percentage >= _STRONG_THRESHOLD]
        weak_topics = [t.topic_name for t in topic_scores if t.percentage < _STRONG_THRESHOLD]

        difficulty_breakdown: dict[str, float] = {}
        if topic_scores:
            difficulty_breakdown = {t.topic_name: round(t.percentage, 1) for t in topic_scores}

        if strong_topics and weak_topics:
            summary = (
                f"You scored {percentage:.1f}% overall. You performed well in "
                f"{', '.join(strong_topics)}, but need to focus more on {', '.join(weak_topics)}."
            )
        elif strong_topics:
            summary = f"You scored {percentage:.1f}% overall, with strong performance across all topics covered: {', '.join(strong_topics)}."
        elif weak_topics:
            summary = f"You scored {percentage:.1f}% overall. All assessed topics need more focus: {', '.join(weak_topics)}."
        else:
            summary = f"You scored {percentage:.1f}% overall."

        return PerformanceAnalysis(
            strong_topics=strong_topics,
            weak_topics=weak_topics,
            difficulty_breakdown=difficulty_breakdown,
            summary=summary,
        )

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        if not context_chunks:
            return (
                f"### Notes for {topic_name}\n\n"
                f"No grounded course material was found for **{topic_name}** yet. "
                "Add this course's content to the knowledge base (syllabus, lessons, or trainer notes) "
                "so personalized notes can be generated directly from real material.\n\n"
                "In the meantime, review your course materials and lesson recordings for this topic, "
                "and consult your trainer for clarification on key concepts."
            )
        combined = "\n\n".join(context_chunks)
        summary_text = await asyncio.to_thread(_summarize_text, combined)
        return (
            f"### Notes for {topic_name}\n\n"
            f"**Summary**\n\n{summary_text}\n\n"
            f"**Source material referenced**\n\n" + "\n\n".join(f"- {chunk[:280]}{'...' if len(chunk) > 280 else ''}" for chunk in context_chunks[:5])
        )

    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str]) -> dict:
        days = ["day_1", "day_2", "day_3", "day_4", "day_5"]
        plan: dict[str, str] = {}

        if not weak_topics:
            for day in days:
                plan[day] = (
                    f"Review and reinforce: {', '.join(strong_topics)}. Practice advanced questions to maintain mastery."
                    if strong_topics else "General revision and practice questions across all topics covered."
                )
            return plan

        topic_cycle = list(weak_topics)
        for i, day in enumerate(days):
            if i < len(days) - 1:
                topic = topic_cycle[i % len(topic_cycle)]
                plan[day] = f"Focus on '{topic}': review notes, work through practice questions, and revisit weak areas."
            else:
                plan[day] = (
                    f"Comprehensive review of {', '.join(weak_topics)}"
                    + (f", plus light revision of {', '.join(strong_topics)}." if strong_topics else ".")
                )
        return plan

    async def generate_recommendations(self, percentage: float) -> list[str]:
        if percentage > 85:
            return [
                "Excellent performance — explore the Advanced Learning Path for deeper mastery.",
                "Attempt advanced practice projects to apply your knowledge in realistic scenarios.",
                "Schedule a mock interview session to test your knowledge under pressure.",
            ]
        if percentage >= 60:
            return [
                "Review your personalized notes for the topics you missed questions on.",
                "Work through additional practice questions to reinforce weaker areas.",
                "Revisit lesson material for any topic scoring below 70%.",
            ]
        return [
            "Schedule time with your trainer for remedial guidance on weak topics.",
            "Revisit the course lessons and syllabus material before attempting further assessments.",
            "Complete the extra practice tests provided for this course.",
            "Focus daily study time on your weakest topics using the generated study plan.",
        ]

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        weak_topics = batch_summary.get("weak_topics") or []
        batch_performance = batch_summary.get("batch_performance") or {}
        recommendations = []

        if weak_topics:
            topic_names = [t.get("topic_name", "this topic") for t in weak_topics[:3] if isinstance(t, dict)]
            if topic_names:
                recommendations.append(
                    f"Consider revisiting these topics with the batch: {', '.join(topic_names)} — they show the lowest average scores."
                )

        avg_pct = batch_performance.get("avg_percentage") if isinstance(batch_performance, dict) else None
        if isinstance(avg_pct, (int, float)):
            if avg_pct < 50:
                recommendations.append("Batch average is low — consider scheduling a dedicated revision session before the next assessment.")
            elif avg_pct < 75:
                recommendations.append("Batch is performing moderately — targeted practice on weak topics should help close the gap.")
            else:
                recommendations.append("Batch is performing well overall — consider introducing more advanced material.")

        recommendations.append("Encourage students scoring below average to review their personalized AI notes and study plans.")
        return recommendations[:5]


def _summarize_text(text: str) -> str:
    from app.services.ai.local_models import get_summarizer

    truncated = text[:3000]
    try:
        summarizer = get_summarizer()
        word_count = len(truncated.split())
        max_len = min(150, max(40, word_count // 2))
        result = summarizer(truncated, max_length=max_len, min_length=min(20, max_len - 1), do_sample=False)
        return result[0]["summary_text"]
    except Exception:
        sentences = truncated.split(". ")
        return ". ".join(sentences[:3]).strip() + ("." if sentences else "")
