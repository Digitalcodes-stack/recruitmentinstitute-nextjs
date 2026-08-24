"""Shared prompt text and JSON schemas used by LLM-backed AI providers (e.g. LocalLLMProvider/Ollama)."""

SYSTEM_PROMPT = (
    "You are an academic performance analyst for a recruitment training institute. "
    "You analyze student assessment results, identify strengths and weaknesses, generate "
    "study notes, and produce personalized study plans. Be concise, factual, and strictly follow the requested JSON schema."
)

QUESTION_GENERATOR_SYSTEM_PROMPT = (
    "You are an expert assessment designer for a professional recruitment training institute. "
    "You create high-quality, unambiguous multiple-choice questions (MCQs) assessing recruitment workflows, "
    "sourcing strategies, candidate screening, interviewing, and HR compliance. "
    "Always output valid JSON strictly conforming to the requested schema."
)

FEW_SHOT_MCQ_TURNS = [
    {
        "role": "user",
        "content": (
            "Generate 1 multiple-choice recruitment assessment question based on the following context:\n"
            "Topic: Boolean Search Sourcing\n"
            "Context: Boolean search in candidate sourcing uses operators such as AND, OR, and NOT "
            "to construct precise search strings for talent search engines and candidate databases."
        ),
    },
    {
        "role": "assistant",
        "content": (
            '{"questions": [{'
            '"question_text": "Which Boolean search operator should a technical recruiter use to return candidates who have experience in either Python OR Java in their resume?", '
            '"option_a": "AND", '
            '"option_b": "OR", '
            '"option_c": "NOT", '
            '"option_d": "NEAR", '
            '"correct_option": "B", '
            '"explanation": "The OR operator broadens search queries to match candidate profiles containing either of the specified terms.", '
            '"topic_name": "Boolean Search Sourcing"'
            "}]}"
        ),
    },
    {
        "role": "user",
        "content": (
            "Generate 1 multiple-choice recruitment assessment question based on the following context:\n"
            "Topic: Structured Interviewing\n"
            "Context: Structured interviews evaluate all candidates against identical predefined questions and standardized scoring rubrics to minimize unconscious interviewer bias."
        ),
    },
    {
        "role": "assistant",
        "content": (
            '{"questions": [{'
            '"question_text": "What is the primary benefit of utilizing standardized questions and scoring rubrics across candidate interviews?", '
            '"option_a": "To reduce interview duration to under five minutes", '
            '"option_b": "To eliminate the need for hiring managers to attend interviews", '
            '"option_c": "To minimize unconscious interviewer bias and ensure consistent evaluation", '
            '"option_d": "To guarantee 100% offer acceptance rates", '
            '"correct_option": "C", '
            '"explanation": "Standardized criteria and questions ensure all candidates are assessed equitably, significantly mitigating subjective bias.", '
            '"topic_name": "Structured Interviewing"'
            "}]}"
        ),
    },
]

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "strong_topics": {"type": "array", "items": {"type": "string"}},
        "weak_topics": {"type": "array", "items": {"type": "string"}},
        "difficulty_breakdown": {"type": "object", "additionalProperties": {"type": "number"}},
        "summary": {"type": "string"},
    },
    "required": ["strong_topics", "weak_topics", "difficulty_breakdown", "summary"],
    "additionalProperties": False,
}

STUDY_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "day_1": {"type": "string"},
        "day_2": {"type": "string"},
        "day_3": {"type": "string"},
        "day_4": {"type": "string"},
        "day_5": {"type": "string"},
    },
    "required": ["day_1", "day_2", "day_3", "day_4", "day_5"],
    "additionalProperties": False,
}

RECOMMENDATIONS_SCHEMA = {
    "type": "object",
    "properties": {"recommendations": {"type": "array", "items": {"type": "string"}}},
    "required": ["recommendations"],
    "additionalProperties": False,
}

QUESTIONS_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question_type": {"type": "string", "enum": ["mcq", "true_false", "scenario", "descriptive"]},
                    "topic": {"type": "string"},
                    "question_text": {"type": "string"},
                    "options": {"type": "array", "items": {"type": "string"}},
                    "correct_answer": {"type": "string"},
                },
                "required": ["question_type", "topic", "question_text", "correct_answer"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["questions"],
    "additionalProperties": False,
}
