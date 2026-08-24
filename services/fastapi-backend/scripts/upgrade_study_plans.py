"""
One-shot migration: convert all old string-format study plans to the new
rich object format without requiring students to retake the assessment.

Run from fastapi-backend/:
    python scripts/upgrade_study_plans.py
"""
import asyncio
import json
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import asyncpg
from app.core.config import settings

# ── Rich activity templates (mirrors local_ai_provider.py) ────────────────
_DEEP_ACTIVITIES = [
    {
        "phase": "Foundation Review",
        "icon": "📖",
        "steps": [
            "Open your AI Study Notes for this topic and read the Overview and Key Points sections carefully.",
            "Highlight or write down every term or sentence you cannot immediately explain in your own words.",
            "Look up each flagged item in your course material or lesson notes to fill the gap.",
            "Write a 3–5 sentence plain-English summary of the topic as if explaining it to a classmate.",
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
            "Pause at every point where your explanation becomes vague or uncertain — those are your remaining gaps.",
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

_FINAL_DAY = {
    "phase": "Full Mock Test & Comprehensive Review",
    "icon": "🏆",
    "steps": [
        "Set a timer for the full assessment duration and attempt a complete mock test covering ALL topics.",
        "Do not check notes during the mock — simulate real exam conditions.",
        "After the mock, mark your answers and calculate your percentage per topic.",
        "For any topic where you scored below 70%, re-read that topic's AI Study Notes before tomorrow.",
        "Review the Exam & Assessment Tips section in your notes for each topic you're still unsure about.",
        "Write down 3 things you feel confident about and 2 things you still want to revisit.",
    ],
    "self_test": "Did you score above 70% on ALL weak topics in this mock? If yes, you're ready. If not, repeat Day 1 for remaining gaps.",
    "time_estimate": "90–120 minutes",
    "resources": ["Full assessment question bank", "All AI Study Notes", "Previous assessment result for comparison"],
}


def _parse_old_day(text: str) -> dict:
    """Extract topic and score_pct from old string format."""
    topic = "General Topic"
    score_pct = None

    # "Focus on 'topic name' (you scored X% on this topic): ..."
    m = re.search(r"[Ff]ocus on ['\"]?([^'\"(]+)['\"]?\s*\(you scored ([\d.]+)%", text)
    if m:
        topic = m.group(1).strip().title()
        score_pct = float(m.group(2))
    else:
        # "Focus on 'topic name': ..."
        m2 = re.search(r"[Ff]ocus on ['\"]?([^'\":,]+)['\"]?", text)
        if m2:
            topic = m2.group(1).strip().title()
    return topic, score_pct


def upgrade_plan(old_plan: dict) -> dict:
    entries = list(old_plan.items())
    new_plan = {}

    # Detect if it's already rich
    if entries and isinstance(list(old_plan.values())[0], dict):
        return old_plan  # already upgraded

    review_days = entries[:-1]
    final_entry = entries[-1] if entries else None

    for i, (key, val) in enumerate(review_days):
        text = str(val)
        topic, score_pct = _parse_old_day(text)
        activity = _DEEP_ACTIVITIES[i % len(_DEEP_ACTIVITIES)]

        if score_pct is not None:
            goal = (
                f"Bring your understanding of '{topic}' from "
                f"{score_pct:.0f}% to at least 70% through focused, structured study."
            )
        else:
            goal = f"Build solid understanding of '{topic}' through structured study."

        new_plan[key] = {
            "topic": topic,
            "score_pct": score_pct,
            "phase": activity["phase"],
            "icon": activity["icon"],
            "goal": goal,
            "steps": activity["steps"],
            "self_test": activity["self_test"],
            "time_estimate": activity["time_estimate"],
            "resources": activity["resources"],
        }

    if final_entry:
        key, val = final_entry
        text = str(val)
        # Extract all mentioned topics from final day text
        all_topics_raw = re.findall(r"['\"]([^'\"]+)['\"]", text)
        all_topics = ", ".join(t.title() for t in all_topics_raw[:6]) if all_topics_raw else "All Assessed Topics"
        final = dict(_FINAL_DAY)
        final["topic"] = all_topics or "All Assessed Topics"
        final["score_pct"] = None
        final["goal"] = (
            f"Confirm that all weak topics ({all_topics}) now score above 70% "
            "and you are fully prepared for your next assessment attempt."
        )
        new_plan[key] = final

    return new_plan


async def main():
    # Build sync db URL from async URL
    db_url = settings.database_url.replace(
        "postgresql+asyncpg://", "postgresql://"
    ).replace("+asyncpg", "")

    conn = await asyncpg.connect(db_url)
    rows = await conn.fetch("SELECT id, plan_json::text as plan_text FROM student_study_plans")

    upgraded = 0
    skipped = 0
    for row in rows:
        raw = row["plan_text"]
        if not raw:
            skipped += 1
            continue

        plan = json.loads(raw) if isinstance(raw, str) else raw
        if not plan:
            skipped += 1
            continue

        first_val = list(plan.values())[0] if plan else None
        if isinstance(first_val, dict) and "steps" in first_val:
            skipped += 1
            continue  # already rich format

        new_plan = upgrade_plan(plan)
        await conn.execute(
            "UPDATE student_study_plans SET plan_json = $1 WHERE id = $2",
            json.dumps(new_plan),
            row["id"],
        )
        upgraded += 1
        print(f"  [OK] Upgraded plan id={row['id']} ({len(new_plan)} days)")

    await conn.close()
    print(f"\nDone. Upgraded: {upgraded}, Skipped (already rich): {skipped}")


if __name__ == "__main__":
    asyncio.run(main())
