import asyncio
import re

from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.question_generator import generate_questions_from_content

_STRONG_THRESHOLD = 70.0

_MODULE_HEADING_RE = re.compile(r"^Module\s+\d+:\s*(.+)$", re.IGNORECASE)
_BULLET_RE = re.compile(r"^-\s+(.+)$")


def _flatten_outline_for_nlp(text: str) -> str:
    """Outline-style chunks (from extract_semantic_blocks) look like:
        Module 1: Title
        Topics:
        - Bullet one
        - Bullet two
    KeyBERT/spaCy treat "Topics:" and "Module 1:" as real content if fed
    this verbatim, surfacing structural labels as if they were key terms.
    This turns each block into plain prose sentences — "Title: Bullet one."
    — so NLP extraction only ever sees real content."""
    lines = [ln.strip() for ln in text.splitlines()]
    sentences: list[str] = []
    current_heading = ""
    for line in lines:
        if not line:
            continue
        if line.lower() == "topics:":
            continue
        heading_match = _MODULE_HEADING_RE.match(line)
        if heading_match:
            current_heading = heading_match.group(1).rstrip(".")
            continue
        bullet_match = _BULLET_RE.match(line)
        if bullet_match:
            bullet = bullet_match.group(1).rstrip(".")
            sentences.append(f"{current_heading}: {bullet}." if current_heading else f"{bullet}.")
        else:
            sentences.append(line if line.endswith((".", "!", "?")) else f"{line}.")
    return " ".join(sentences)


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
        display_topic = topic_name.title()
        if not context_chunks:
            return _build_fallback_notes(display_topic)
        combined = "\n\n".join(context_chunks)
        flattened = _flatten_outline_for_nlp(combined)
        return await asyncio.to_thread(_build_rich_notes, display_topic, flattened)

    async def generate_study_plan(
        self, weak_topics: list[str], strong_topics: list[str], difficulty_breakdown: dict[str, float] | None = None
    ) -> dict:
        days = ["day_1", "day_2", "day_3", "day_4", "day_5"]

        if not weak_topics:
            return _build_mastery_plan(days, strong_topics)
        return _build_remediation_plan(days, weak_topics, strong_topics, difficulty_breakdown or {})

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


def _extract_key_points(text: str, top_n: int = 8) -> list[str]:
    """Pull the most relevant sentences using KeyBERT keyphrases as anchors,
    so 'key points' reads as study-note bullets rather than raw keyphrases."""
    from app.services.ai.local_models import get_keybert_model

    try:
        keybert = get_keybert_model()
        keyphrases = keybert.extract_keywords(
            text, keyphrase_ngram_range=(1, 3), stop_words="english", top_n=top_n, use_mmr=True, diversity=0.6
        )
    except Exception:
        return []

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    seen_sentences: set[str] = set()
    points: list[str] = []
    for phrase, _score in keyphrases:
        match = next((s for s in sentences if phrase.lower() in s.lower() and s not in seen_sentences), None)
        if match:
            seen_sentences.add(match)
            points.append(match if len(match) <= 220 else match[:217] + "...")
        else:
            points.append(phrase.capitalize())
    return points


def _extract_glossary(text: str, max_terms: int = 6) -> list[str]:
    """Surface the topic's recurring noun phrases as a quick-reference glossary."""
    from collections import Counter

    from app.services.ai.local_models import get_spacy_model

    try:
        nlp = get_spacy_model()
        doc = nlp(text[:5000])
    except Exception:
        return []

    candidates = Counter()
    for chunk in doc.noun_chunks:
        term = chunk.text.strip()
        normalized = term.lower()
        if 1 < len(term.split()) <= 4 and not normalized.isdigit() and len(term) > 3:
            candidates[term.title()] += 1

    return [term for term, _count in candidates.most_common(max_terms)]


def _build_study_notes(text: str) -> tuple[str, list[str], list[str]]:
    summary = _summarize_text(text)
    key_points = _extract_key_points(text)
    glossary = _extract_glossary(text)
    return summary, key_points, glossary


def _extract_sentences(text: str, min_words: int = 6) -> list[str]:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    return [s for s in sentences if len(s.split()) >= min_words]


def _extract_key_points_extended(text: str, top_n: int = 15) -> list[str]:
    from app.services.ai.local_models import get_keybert_model
    try:
        keybert = get_keybert_model()
        keyphrases = keybert.extract_keywords(
            text, keyphrase_ngram_range=(1, 3), stop_words="english", top_n=top_n, use_mmr=True, diversity=0.7
        )
    except Exception:
        return []
    sentences = _extract_sentences(text)
    seen: set[str] = set()
    points: list[str] = []
    for phrase, _score in keyphrases:
        match = next((s for s in sentences if phrase.lower() in s.lower() and s not in seen), None)
        if match:
            seen.add(match)
            clean = match if len(match) <= 260 else match[:257] + "..."
            points.append(clean[0].upper() + clean[1:] if clean else clean)
        else:
            points.append(phrase.title())
    return points


def _extract_glossary_extended(text: str, max_terms: int = 10) -> list[str]:
    from collections import Counter
    from app.services.ai.local_models import get_spacy_model
    try:
        nlp = get_spacy_model()
        doc = nlp(text[:6000])
    except Exception:
        return []
    candidates: Counter = Counter()
    for chunk in doc.noun_chunks:
        term = chunk.text.strip()
        normalized = term.lower()
        if 1 < len(term.split()) <= 4 and not normalized.isdigit() and len(term) > 3:
            candidates[term.title()] += 1
    return [term for term, _count in candidates.most_common(max_terms)]


def _extract_practical_examples(text: str, topic: str, count: int = 5) -> list[str]:
    """Pull sentences that contain action words or real-world indicators."""
    action_words = {"conduct", "perform", "use", "apply", "implement", "manage", "develop",
                    "create", "design", "evaluate", "assess", "identify", "build", "establish",
                    "ensure", "review", "analyse", "analyze", "plan", "execute", "hire",
                    "screen", "interview", "onboard", "train", "recruit", "select"}
    sentences = _extract_sentences(text, min_words=8)
    examples: list[str] = []
    seen: set[str] = set()
    for s in sentences:
        words = set(s.lower().split())
        if words & action_words and s not in seen:
            seen.add(s)
            clean = s[0].upper() + s[1:] if s else s
            examples.append(clean if clean.endswith(".") else clean + ".")
        if len(examples) >= count:
            break
    return examples


def _extract_what_why_how(text: str, topic: str) -> dict[str, list[str]]:
    """Group sentences into What / Why / How buckets by signal words."""
    sentences = _extract_sentences(text, min_words=7)
    what_signals  = {"is", "are", "refers", "means", "defined", "known", "called", "term", "concept"}
    why_signals   = {"because", "reason", "important", "benefit", "advantage", "helps", "enables",
                     "ensures", "critical", "essential", "key", "vital", "necessary"}
    how_signals   = {"by", "through", "using", "process", "step", "method", "approach",
                     "conduct", "perform", "implement", "way", "technique", "procedure"}
    buckets: dict[str, list[str]] = {"what": [], "why": [], "how": []}
    seen: set[str] = set()
    for s in sentences:
        if s in seen:
            continue
        words = set(s.lower().split())
        clean = (s[0].upper() + s[1:]) if s else s
        if not clean.endswith("."): clean += "."
        if words & what_signals and len(buckets["what"]) < 3:
            buckets["what"].append(clean); seen.add(s)
        elif words & why_signals and len(buckets["why"]) < 3:
            buckets["why"].append(clean); seen.add(s)
        elif words & how_signals and len(buckets["how"]) < 4:
            buckets["how"].append(clean); seen.add(s)
    return buckets


def _build_rich_notes(display_topic: str, text: str) -> str:
    summary       = _summarize_text(text)
    key_points    = _extract_key_points_extended(text, top_n=15)
    glossary      = _extract_glossary_extended(text, max_terms=10)
    examples      = _extract_practical_examples(text, display_topic, count=5)
    wwh           = _extract_what_why_how(text, display_topic)

    lines: list[str] = []

    # ── Overview ──────────────────────────────────────
    lines += [f"### Overview\n", f"{summary}\n"]

    # ── What / Why / How breakdown ────────────────────
    if any(wwh.values()):
        lines.append("### Understanding The Topic\n")
        if wwh["what"]:
            lines.append(f"**What is {display_topic}?**\n")
            lines.extend(f"- {pt}" for pt in wwh["what"])
            lines.append("")
        if wwh["why"]:
            lines.append(f"**Why It Matters**\n")
            lines.extend(f"- {pt}" for pt in wwh["why"])
            lines.append("")
        if wwh["how"]:
            lines.append(f"**How It Works In Practice**\n")
            lines.extend(f"- {pt}" for pt in wwh["how"])
            lines.append("")

    # ── Key points ────────────────────────────────────
    if key_points:
        lines.append("### Key Points To Remember\n")
        for pt in key_points:
            lines.append(f"- {pt}")
        lines.append("")

    # ── Practical application ─────────────────────────
    if examples:
        lines.append("### Practical Application\n")
        lines.append(f"The following examples from course material show **{display_topic}** in action:\n")
        for ex in examples:
            lines.append(f"- {ex}")
        lines.append("")

    # ── Common mistakes ───────────────────────────────
    lines += [
        "### Common Mistakes To Avoid\n",
        f"- Confusing **{display_topic}** with adjacent concepts — always refer back to its core definition.",
        "- Skipping the foundational steps and moving to advanced application before mastering the basics.",
        "- Not linking this topic to real-world recruitment scenarios during your assessment.",
        "- Memorising facts without understanding the underlying reasoning or process.",
        "",
    ]

    # ── Exam tips ─────────────────────────────────────
    lines += [
        "### Exam & Assessment Tips\n",
        f"- When you see a question on **{display_topic}**, identify whether it is asking for a definition, a process, or an application.",
        "- Read all four options carefully — eliminate obviously wrong ones first, then compare the remaining two.",
        "- Scenario questions will describe a workplace situation; anchor your answer to the correct step or principle.",
        "- If unsure, recall the source sentence from your study notes that mentions the key term in the question.",
        "",
    ]

    # ── Key terms glossary ────────────────────────────
    if glossary:
        lines.append("### Key Terms & Concepts\n")
        for term in glossary:
            lines.append(f"- **{term}**")
        lines.append("")

    # ── Source references ─────────────────────────────
    source_sentences = [s.strip() for s in text.split(". ") if len(s.strip().split()) >= 6][:6]
    if source_sentences:
        lines.append("### Source Material Referenced\n")
        for s in source_sentences:
            clean = (s[0].upper() + s[1:]) if s else s
            lines.append(f"- {clean.rstrip('.')}.")
        lines.append("")

    return "\n".join(lines)


def _build_fallback_notes(display_topic: str) -> str:
    """Rich domain-knowledge notes for when no course embeddings exist yet."""
    return "\n".join([
        f"### Overview\n",
        f"**{display_topic}** is a core concept in the recruitment and HR management domain. "
        f"Understanding {display_topic} is essential for anyone working in talent acquisition, "
        "human resources, or organisational development. Mastery of this topic helps you "
        "contribute effectively to hiring processes, candidate experience, and workforce planning.\n",

        "### Understanding The Topic\n",
        f"**What is {display_topic}?**\n",
        f"- {display_topic} refers to the structured set of activities, principles, and practices "
        "that govern how organisations attract, assess, and select the right candidates.",
        "- It covers both strategic (big-picture) and operational (day-to-day) perspectives of the hiring lifecycle.",
        "",
        "**Why It Matters**\n",
        "- Effective execution of this topic directly impacts the quality of hires, cost-per-hire, and time-to-fill metrics.",
        "- Poor understanding leads to compliance risks, unconscious bias, and loss of top talent to competitors.",
        "- It underpins employer branding and long-term employee retention strategies.",
        "",
        "**How It Works In Practice**\n",
        "- Practitioners follow a defined process: job analysis → sourcing → screening → interviewing → selection → offer → onboarding.",
        "- Tools such as Applicant Tracking Systems (ATS), psychometric tests, and structured interview scorecards are commonly used.",
        "- Regular audits and data-driven reviews ensure continuous improvement of the process.",
        "",

        "### Key Points To Remember\n",
        f"- {display_topic} must align with the organisation's broader talent strategy and business goals.",
        "- Legal compliance (equal opportunity, data protection, anti-discrimination) is non-negotiable at every stage.",
        "- Candidate experience matters — a poor process damages your employer brand even for rejected applicants.",
        "- Structured, criteria-based evaluation reduces bias and improves predictive validity of hiring decisions.",
        "- Metrics such as offer acceptance rate, quality of hire, and retention rate measure process effectiveness.",
        "- Collaboration between HR, hiring managers, and leadership is essential for successful outcomes.",
        "",

        "### Practical Application\n",
        f"Here is how **{display_topic}** appears in real recruitment scenarios:\n",
        "- A recruiter uses a competency framework to write job descriptions that attract the right candidates.",
        "- A hiring manager conducts a STAR-method (Situation, Task, Action, Result) structured interview.",
        "- An HR analyst reviews time-to-hire and quality-of-hire dashboards to identify bottlenecks.",
        "- An onboarding coordinator designs a 90-day induction plan to maximise new-hire retention.",
        "- A talent acquisition team uses social media and employee referrals to build a diverse candidate pipeline.",
        "",

        "### Common Mistakes To Avoid\n",
        f"- Treating **{display_topic}** as a purely administrative function rather than a strategic driver.",
        "- Relying solely on gut feeling during candidate evaluation instead of structured assessment criteria.",
        "- Neglecting post-hire follow-up, which is critical for understanding whether the selection decision was correct.",
        "- Failing to brief hiring managers on legal obligations and structured interview techniques.",
        "",

        "### Exam & Assessment Tips\n",
        f"- Questions on **{display_topic}** often test your ability to apply concepts to realistic workplace scenarios.",
        "- Focus on the sequence of steps in any process — assessments frequently test whether you know what comes first.",
        "- Distinguish between similar-sounding terms (e.g. recruitment vs. selection, screening vs. shortlisting).",
        "- For scenario questions: identify the problem → recall the correct principle → select the answer that follows that principle.",
        "",

        "### Key Terms & Concepts\n",
        "- **Job Analysis** — Systematic process of identifying the duties, skills, and requirements of a role.",
        "- **Competency Framework** — A defined set of behaviours and skills used to evaluate candidates consistently.",
        "- **Applicant Tracking System (ATS)** — Software that manages candidate data throughout the hiring pipeline.",
        "- **Structured Interview** — A standardised interview using pre-defined questions and scoring rubrics.",
        "- **Employer Branding** — The reputation and perception of an organisation as a place to work.",
        "- **Onboarding** — The process of integrating a new hire into the organisation, role, and culture.",
        "- **Time-to-Fill** — The number of days from job opening to accepted offer — a key recruitment efficiency metric.",
        "- **Quality of Hire** — A composite metric measuring how well a new hire performs and fits the organisation.",
        "",
    ])


_DEEP_ACTIVITIES = [
    {
        "phase": "Foundation Review",
        "icon": "📖",
        "steps": [
            "Open your AI Study Notes for this topic and read the Overview and Key Points sections carefully.",
            "Highlight or write down every term or sentence you cannot immediately explain in your own words.",
            "Look up each flagged item in your course material or lesson notes to fill the gap.",
            "Write a 3-5 sentence plain-English summary of the topic as if explaining it to a classmate.",
            "Read the 'Common Mistakes' section in your notes and tick off which mistakes you made in the assessment.",
        ],
        "self_test": "Can you define the topic in one sentence and list at least 3 key facts about it without looking at your notes?",
        "time_estimate": "45–60 minutes",
        "resources": ["AI Study Notes → Overview", "Course lesson slides or recording", "Trainer notes if available"],
    },
    {
        "phase": "Active Practice",
        "icon": "✏️",
        "steps": [
            "Attempt 10–15 practice questions on this topic from your question bank or past assessment.",
            "For every wrong answer, write down WHY you chose the wrong option and what the correct reasoning is.",
            "Create a flashcard (physical or digital) for each concept you got wrong.",
            "Re-attempt only the questions you got wrong — aim for 100% on the second pass.",
            "Time yourself: if each question takes more than 90 seconds you need more content revision.",
        ],
        "self_test": "Can you answer 8 out of 10 random questions on this topic correctly without notes?",
        "time_estimate": "60–75 minutes",
        "resources": ["Assessment question bank", "AI Study Notes → Key Points To Remember", "Flashcard app (Anki/Quizlet)"],
    },
    {
        "phase": "Teach-Back & Consolidation",
        "icon": "🎤",
        "steps": [
            "Explain the entire topic out loud as if delivering a 5-minute mini-lesson — record yourself if possible.",
            "Pause at every point where your explanation becomes vague or you feel uncertain — those are your remaining gaps.",
            "Write a one-page structured summary: What is it? Why does it matter? How does it work in practice?",
            "Compare your written summary against the Key Terms section in your AI Notes — did you miss any?",
            "Share your summary with a study partner or trainer for feedback.",
        ],
        "self_test": "Can you teach this topic end-to-end in 5 minutes without hesitation or notes?",
        "time_estimate": "45–60 minutes",
        "resources": ["AI Study Notes → Understanding The Topic", "Practical Application section", "Study partner or trainer"],
    },
    {
        "phase": "Scenario Application",
        "icon": "🏢",
        "steps": [
            "Find 2–3 scenario-based questions on this topic (your trainer or question bank can provide these).",
            "For each scenario, write out your reasoning step-by-step before selecting an answer.",
            "Review the Practical Application section of your AI Notes — can you map each example to a scenario?",
            "Create your own mini-scenario: describe a workplace situation where this topic applies, then explain the correct response.",
            "Review your correct reasoning for all scenarios against the assessment's explanation field.",
        ],
        "self_test": "Can you correctly identify the right action in 3 different real-world scenarios involving this topic?",
        "time_estimate": "50–70 minutes",
        "resources": ["AI Study Notes → Practical Application", "Scenario questions from trainer", "Assessment explanations"],
    },
]

_FINAL_DAY_PLAN = {
    "phase": "Full Mock Test & Review",
    "icon": "🏆",
    "steps": [
        "Set a timer for the full assessment duration and attempt a complete mock test covering ALL topics.",
        "Do not check notes during the mock — simulate real exam conditions.",
        "After the mock, mark your answers and calculate your percentage per topic.",
        "For any topic where you scored below 70%, re-read that topic's AI Study Notes before tomorrow.",
        "Review the Exam & Assessment Tips section in your notes for each topic you're still unsure about.",
        "Write down 3 things you feel confident about and 2 things you still want to revisit.",
    ],
    "self_test": "Did you score above 70% on ALL weak topics in this mock? If yes, you're ready. If not, repeat Day 1 for the remaining gaps.",
    "time_estimate": "90–120 minutes",
    "resources": ["Full assessment question bank", "All AI Study Notes", "Previous assessment result for comparison"],
}


def _build_mastery_plan(days: list[str], strong_topics: list[str]) -> dict:
    topics_str = ", ".join(t.title() for t in strong_topics) if strong_topics else "all assessed topics"
    mastery_days = [
        {
            "phase": "Advanced Depth Review",
            "icon": "🔬",
            "topic": topics_str,
            "score_pct": None,
            "goal": f"Push beyond surface recall — find edge cases and nuances in {topics_str}.",
            "steps": [
                f"Re-read your AI Study Notes for {topics_str} focusing on Key Terms and Practical Application.",
                "Search for anything in the notes you couldn't explain in detail — those are depth gaps, not knowledge gaps.",
                "Look up advanced examples or case studies for each strong topic beyond the course material.",
                "Write down 5 exam questions you would set on this topic if you were the examiner.",
                "Answer your own questions — if you struggle, revisit the relevant course lesson.",
            ],
            "self_test": "Can you answer your own 5 examiner-level questions perfectly?",
            "time_estimate": "60 minutes",
            "resources": ["AI Study Notes", "Course lessons", "Online recruitment HR resources"],
        },
        {
            "phase": "Scenario Mastery",
            "icon": "🏢",
            "topic": topics_str,
            "score_pct": None,
            "goal": "Apply strong topics to complex, multi-layered workplace scenarios.",
            "steps": [
                f"Attempt the hardest scenario-based questions available on {topics_str}.",
                "For each scenario, write a structured response: situation → principle applied → expected outcome.",
                "Identify any scenario where you were uncertain — these reveal remaining blind spots.",
                "Ask your trainer for stretch questions that go beyond the standard assessment level.",
                "Review every incorrect answer with full written reasoning.",
            ],
            "self_test": "Can you solve all scenario questions without hesitation and explain your reasoning to a trainer?",
            "time_estimate": "60–75 minutes",
            "resources": ["Trainer-provided stretch questions", "Scenario question bank", "AI Study Notes → Practical Application"],
        },
        {
            "phase": "Teach & Synthesise",
            "icon": "🎤",
            "topic": topics_str,
            "score_pct": None,
            "goal": "Cement mastery by teaching and connecting topics to the broader course.",
            "steps": [
                f"Prepare a 10-minute verbal presentation on {topics_str} as if delivering a training session.",
                "Explicitly connect these topics to each other — how do they interact in a real recruitment workflow?",
                "Write a 1-page executive summary: what a new HR professional must know about these topics.",
                "Share your presentation or summary with your trainer for expert feedback.",
                "Revise based on feedback — any gap the trainer spots becomes your final revision priority.",
            ],
            "self_test": "Can you deliver a 10-minute coherent training on these topics to a peer?",
            "time_estimate": "75 minutes",
            "resources": ["Your written summaries", "Trainer feedback", "Course curriculum outline"],
        },
        {
            "phase": "Mock Test Under Pressure",
            "icon": "⏱️",
            "topic": topics_str,
            "score_pct": None,
            "goal": "Validate mastery holds under timed exam conditions.",
            "steps": [
                "Set a strict timer and attempt a full timed mock assessment.",
                "If you finish early, use remaining time to review flagged questions — don't leave early.",
                "After the mock, calculate your score: you should be above 85% on all topics.",
                "For any topic below 85%, spend 20 minutes on targeted revision before the final day.",
                "Write a confidence rating (1–10) for each topic after the mock.",
            ],
            "self_test": "Did you score above 85% across all topics under timed conditions?",
            "time_estimate": "90 minutes",
            "resources": ["Full assessment question bank", "Timer", "All AI Study Notes"],
        },
        {
            "phase": "Excellence & Stretch Goals",
            "icon": "🏆",
            "topic": topics_str,
            "score_pct": None,
            "goal": "Achieve 95%+ and explore beyond the course syllabus.",
            "steps": [
                "Identify the 2–3 questions you were least confident about in the mock and deep-dive on those.",
                "Research one advanced real-world case study for each strong topic.",
                "Prepare 3 insightful questions to ask your trainer — great learners always have questions.",
                "Review the full course curriculum: are there any modules you haven't fully explored?",
                "Set a personal target for your next assessment attempt and write it down.",
            ],
            "self_test": "Are you ready to score 95%+ and confidently discuss any aspect of these topics with a senior recruiter?",
            "time_estimate": "60 minutes",
            "resources": ["Advanced HR/recruitment reading", "Trainer Q&A session", "Course curriculum"],
        },
    ]
    return {day: mastery_days[i % len(mastery_days)] for i, day in enumerate(days)}


def _build_remediation_plan(
    days: list[str],
    weak_topics: list[str],
    strong_topics: list[str],
    difficulty_breakdown: dict[str, float],
) -> dict:
    def weight(topic: str) -> float:
        pct = difficulty_breakdown.get(topic)
        return max(1.0, 100.0 - pct) if pct is not None else 50.0

    weighted_topics = sorted(weak_topics, key=weight, reverse=True)
    review_days = days[:-1]

    # Allocate days proportionally by weakness weight
    schedule: list[str] = []
    if weighted_topics:
        total_weight = sum(weight(t) for t in weighted_topics)
        allocations = [max(1, round(weight(t) / total_weight * len(review_days))) for t in weighted_topics]
        for topic, count in zip(weighted_topics, allocations):
            schedule.extend([topic] * count)
        while len(schedule) < len(review_days):
            schedule.append(weighted_topics[0])
        schedule = schedule[: len(review_days)]

    plan: dict = {}
    for i, day in enumerate(review_days):
        topic = schedule[i] if i < len(schedule) else weighted_topics[i % len(weighted_topics)]
        activity = _DEEP_ACTIVITIES[i % len(_DEEP_ACTIVITIES)]
        pct = difficulty_breakdown.get(topic)
        plan[day] = {
            "topic": topic.title(),
            "score_pct": round(pct, 1) if pct is not None else None,
            "phase": activity["phase"],
            "icon": activity["icon"],
            "goal": (
                f"Bring your understanding of '{topic.title()}' from "
                f"{pct:.0f}% to at least 70% through focused, structured study."
                if pct is not None else
                f"Build solid understanding of '{topic.title()}' through structured study."
            ),
            "steps": activity["steps"],
            "self_test": activity["self_test"],
            "time_estimate": activity["time_estimate"],
            "resources": activity["resources"],
        }

    # Final day: comprehensive review
    final_day = days[-1]
    all_topics_str = ", ".join(t.title() for t in weak_topics)
    strong_str = ", ".join(t.title() for t in strong_topics) if strong_topics else None
    final = dict(_FINAL_DAY_PLAN)
    final["topic"] = all_topics_str
    final["score_pct"] = None
    final["goal"] = (
        f"Confirm that all weak topics ({all_topics_str}) now score above 70%, "
        + (f"and maintain your strength in {strong_str}." if strong_str else "and you are ready for the next attempt.")
    )
    plan[final_day] = final
    return plan
