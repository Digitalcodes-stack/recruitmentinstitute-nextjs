"""Local, model-free question generation from course content.

Hybrid offline pipeline:
- spaCy (entity/noun-phrase extraction) + KeyBERT (sentence-transformers
  based keyword extraction) + NLTK (sentence tokenization) identify the key
  concepts and source sentences.
- sentence-transformers embedding similarity ranks plausible-but-wrong
  distractors from the same document's other key terms, so options aren't
  picked at random.
- WordNet supplements distractors for single-word terms when a close
  embedding match isn't available.

No generative LLM call — purely extractive/templated, so it's deterministic,
fast, and runs fully offline. Kept behind generate_questions_from_content()
so a stronger local model could be swapped in later (see AIProvider) without
touching call sites.
"""

import re
import random

import numpy as np

from app.services.ai.local_models import ensure_nltk_data, get_keybert_model, get_sentence_embedder, get_spacy_model

_MIN_SENTENCE_WORDS = 6
_DEFAULT_TOPIC = "Course Content"
_MIN_DISTRACTOR_SIMILARITY = 0.25
_MAX_DISTRACTOR_SIMILARITY = 0.85
_EASY_MAX_WORDS = 12
_HARD_MIN_WORDS = 24

# Bloom's Taxonomy level by question type: true/false and fill-in-the-blank
# MCQs test recall (Remember); scenario questions require applying a concept
# to a new situation (Apply); descriptive/short-answer requires articulating
# understanding in your own words (Understand).
_BLOOM_LEVEL_BY_TYPE = {
    "mcq": "remember",
    "true_false": "remember",
    "scenario": "apply",
    "descriptive": "understand",
}

_ESTIMATED_SECONDS_BY_DIFFICULTY = {"easy": 30, "medium": 60, "hard": 90}


def _enrich(question: dict) -> dict:
    question["bloom_level"] = _BLOOM_LEVEL_BY_TYPE.get(question["question_type"], "remember")
    question["estimated_time_seconds"] = _ESTIMATED_SECONDS_BY_DIFFICULTY.get(question.get("difficulty", "medium"), 60)
    return question


def _difficulty_for_sentence(sentence: str) -> str:
    """Heuristic only: longer source sentences tend to carry more
    qualifying clauses/conditions, which makes the resulting question
    harder to reason about than a short, single-fact sentence."""
    word_count = len(sentence.split())
    if word_count <= _EASY_MAX_WORDS:
        return "easy"
    if word_count >= _HARD_MIN_WORDS:
        return "hard"
    return "medium"


_BULLET_LINE = re.compile(r"^-\s+(.+)$")


def _expand_outline_blocks(text: str) -> tuple[list[str], str]:
    """Detect "Heading\nTopics:\n- bullet\n- bullet" blocks (produced by
    extract_semantic_blocks for outline-style course content) and turn each
    bullet into its own short, context-bearing unit — "{Heading} — {bullet}."
    — instead of leaving 2-4 word bullets too short to question on their own.
    Returns (expanded_units, remaining_text) where remaining_text is
    whatever didn't match the outline shape, for normal sentence splitting.
    """
    units: list[str] = []
    leftover_paragraphs: list[str] = []

    for paragraph in text.split("\n\n"):
        lines = [ln.strip() for ln in paragraph.splitlines() if ln.strip()]
        if len(lines) < 3 or lines[1].lower() != "topics:":
            leftover_paragraphs.append(paragraph)
            continue

        heading = lines[0]
        bullets = [m.group(1) for ln in lines[2:] if (m := _BULLET_LINE.match(ln))]
        if not bullets:
            leftover_paragraphs.append(paragraph)
            continue

        for bullet in bullets:
            units.append(f"{heading} - {bullet}.")

    return units, "\n\n".join(leftover_paragraphs)


def _split_sentences(text: str) -> list[str]:
    ensure_nltk_data()
    import nltk

    outline_units, remaining_text = _expand_outline_blocks(text)

    try:
        sentences = nltk.sent_tokenize(remaining_text) if remaining_text.strip() else []
    except Exception:
        sentences = [s.strip() for s in remaining_text.split(".") if s.strip()]

    # Outline units are intentionally short (heading + bullet, not full
    # prose), so they're exempt from the prose minimum-word filter that
    # exists to reject orphaned fragments with no context.
    prose_filtered = [s.strip() for s in sentences if len(s.split()) >= _MIN_SENTENCE_WORDS]
    return outline_units + prose_filtered


def _extract_key_terms(text: str, top_n: int = 15) -> list[str]:
    kw_model = get_keybert_model()
    pairs = kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words="english", top_n=top_n)
    return [term for term, _score in pairs]


def _extract_entities(text: str) -> list[str]:
    nlp = get_spacy_model()
    doc = nlp(text)
    entities = {ent.text for ent in doc.ents}
    noun_chunks = {chunk.text for chunk in doc.noun_chunks if len(chunk.text.split()) <= 3}
    return list(entities | noun_chunks)


def _sentence_for_term(sentences: list[str], term: str) -> str | None:
    term_lower = term.lower()
    for sentence in sentences:
        if term_lower in sentence.lower():
            return sentence
    return None


class _DistractorBank:
    """Ranks candidate distractors by embedding similarity to the correct
    term, so options are plausible (related concept) rather than random."""

    def __init__(self, terms: list[str]) -> None:
        self._terms = terms
        self._embeddings: np.ndarray | None = None
        if terms:
            model = get_sentence_embedder()
            self._embeddings = model.encode(terms, convert_to_numpy=True, normalize_embeddings=True)

    def for_term(self, term: str, count: int = 3) -> list[str]:
        candidates = self._similar_terms(term, count)
        if len(candidates) < count:
            candidates.extend(_wordnet_distractors(term, count - len(candidates)))
        if len(candidates) < count:
            pool = [t for t in self._terms if t.lower() != term.lower() and t not in candidates]
            random.shuffle(pool)
            candidates.extend(pool[: count - len(candidates)])
        while len(candidates) < count:
            candidates.append(f"{term} (alternate)")
        return candidates[:count]

    def _similar_terms(self, term: str, count: int) -> list[str]:
        if self._embeddings is None or term not in self._terms:
            return []
        idx = self._terms.index(term)
        query = self._embeddings[idx]
        scores = self._embeddings @ query
        ranked = sorted(
            ((score, other_term) for score, other_term in zip(scores, self._terms) if other_term.lower() != term.lower()),
            key=lambda pair: pair[0],
            reverse=True,
        )
        plausible = [t for score, t in ranked if _MIN_DISTRACTOR_SIMILARITY <= score <= _MAX_DISTRACTOR_SIMILARITY]
        return plausible[:count]


def _wordnet_distractors(term: str, count: int) -> list[str]:
    """Single-word terms only: pull sibling words (shared hypernym) from
    WordNet as a fallback when the document doesn't have enough related
    key terms of its own."""
    if count <= 0 or " " in term.strip():
        return []
    try:
        ensure_nltk_data()
        from nltk.corpus import wordnet as wn
    except Exception:
        return []

    siblings: list[str] = []
    try:
        for synset in wn.synsets(term)[:2]:
            for hypernym in synset.hypernyms():
                for hyponym in hypernym.hyponyms():
                    name = hyponym.lemmas()[0].name().replace("_", " ")
                    if name.lower() != term.lower() and name not in siblings:
                        siblings.append(name)
    except Exception:
        return []
    return siblings[:count]


def _make_mcq(sentence: str, term: str, distractor_bank: "_DistractorBank", topic: str) -> dict | None:
    if term.lower() not in sentence.lower():
        return None
    blanked = _replace_case_insensitive(sentence, term, "_____")
    distractors = distractor_bank.for_term(term, 3)
    options = distractors + [term]
    random.shuffle(options)
    letters = ["A", "B", "C", "D"]
    option_map = {letters[i]: opt for i, opt in enumerate(options)}
    correct_letter = next(letter for letter, opt in option_map.items() if opt == term)
    return {
        "question_type": "mcq",
        "topic": topic,
        "question_text": f"Fill in the blank: {blanked}",
        "options": [option_map[letter] for letter in letters],
        "correct_answer": option_map[correct_letter],
        "explanation": f"The source material states: \"{sentence}\" — so \"{term}\" is the term that completes this sentence correctly.",
        "difficulty": _difficulty_for_sentence(sentence),
    }


def _replace_case_insensitive(text: str, target: str, replacement: str) -> str:
    idx = text.lower().find(target.lower())
    if idx == -1:
        return text
    return text[:idx] + replacement + text[idx + len(target):]


def _make_true_false(sentence: str, topic: str, negate: bool) -> dict:
    difficulty = _difficulty_for_sentence(sentence)
    if negate:
        negated = _negate_sentence(sentence)
        return {
            "question_type": "true_false",
            "topic": topic,
            "question_text": negated,
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": f"This statement contradicts the course material, which states: \"{sentence}\"",
            "difficulty": difficulty,
        }
    return {
        "question_type": "true_false",
        "topic": topic,
        "question_text": sentence,
        "options": ["True", "False"],
        "correct_answer": "True",
        "explanation": f"This statement is taken directly from the course material on {topic}.",
        "difficulty": difficulty,
    }


def _negate_sentence(sentence: str) -> str:
    for positive, negative in (("is", "is not"), ("are", "are not"), ("can", "cannot"), ("will", "will not")):
        if f" {positive} " in f" {sentence} ":
            return sentence.replace(f" {positive} ", f" {negative} ", 1)
    return f"It is not true that {sentence[0].lower()}{sentence[1:]}"


def _make_scenario(sentence: str, term: str, distractor_bank: "_DistractorBank", topic: str) -> dict:
    base_mcq = _make_mcq(sentence, term, distractor_bank, topic)
    question_text = (
        f"A trainee encounters the following situation related to {topic}: {sentence} "
        "What is the most appropriate understanding of this scenario?"
    )
    if base_mcq:
        base_mcq["question_type"] = "scenario"
        base_mcq["question_text"] = question_text
        base_mcq["difficulty"] = "hard" if base_mcq["difficulty"] != "easy" else "medium"
        return base_mcq
    return {
        "question_type": "scenario",
        "topic": topic,
        "question_text": question_text,
        "options": None,
        "correct_answer": term,
        "explanation": f"Applying \"{term}\" to this scenario follows directly from: \"{sentence}\"",
        "difficulty": "hard",
    }


def _make_descriptive(sentence: str, term: str, topic: str) -> dict:
    return {
        "question_type": "descriptive",
        "topic": topic,
        "question_text": f"Explain '{term}' in the context of {topic}, referencing the relevant course material.",
        "options": None,
        "correct_answer": sentence,
        "explanation": f"A complete answer should cover: \"{sentence}\"",
        "difficulty": "medium",
    }


def generate_questions_from_content(context_text: str, question_types: list[str], count: int, topic: str = _DEFAULT_TOPIC) -> list[dict]:
    sentences = _split_sentences(context_text)
    if not sentences:
        sentences = [context_text.strip()] if context_text.strip() else []
    if not sentences:
        return []

    key_terms = _extract_key_terms(context_text, top_n=max(30, count * 2)) or _extract_entities(context_text)
    if not key_terms:
        key_terms = [s.split()[0] for s in sentences[:5]]

    distractor_bank = _DistractorBank(key_terms)
    allowed_types = [t for t in question_types if t in ("mcq", "true_false", "scenario", "descriptive")] or ["mcq"]

    questions: list[dict] = []
    term_idx = 0
    sentence_idx = 0
    attempts = 0
    max_attempts = count * 8

    while len(questions) < count and attempts < max_attempts:
        attempts += 1
        q_type = allowed_types[len(questions) % len(allowed_types)]
        term = key_terms[term_idx % len(key_terms)]
        term_idx += 1
        question_topic = term if term != term.lower() or len(term.split()) > 1 else topic

        sentence = _sentence_for_term(sentences, term) or sentences[sentence_idx % len(sentences)]
        sentence_idx += 1

        question: dict | None = None
        if q_type == "mcq":
            question = _make_mcq(sentence, term, distractor_bank, question_topic)
        elif q_type == "true_false":
            question = _make_true_false(sentence, question_topic, negate=bool(len(questions) % 2))
        elif q_type == "scenario":
            question = _make_scenario(sentence, term, distractor_bank, question_topic)
        elif q_type == "descriptive":
            question = _make_descriptive(sentence, term, question_topic)

        if question:
            questions.append(_enrich(question))

    return questions
