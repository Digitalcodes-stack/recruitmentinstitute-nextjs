"""Local, model-free question generation from course content.

Uses spaCy (entity/noun-phrase extraction) + KeyBERT (keyword extraction,
itself sentence-transformers-based) + nltk (sentence tokenization) to build
MCQ, true/false, scenario, and descriptive questions from real context text.
No generative LLM call — purely extractive/templated, so it's deterministic
and runs fully offline.
"""

import random

from app.services.ai.local_models import ensure_nltk_data, get_keybert_model, get_spacy_model

_MIN_SENTENCE_WORDS = 6
_DEFAULT_TOPIC = "Course Content"


def _split_sentences(text: str) -> list[str]:
    ensure_nltk_data()
    import nltk

    try:
        sentences = nltk.sent_tokenize(text)
    except Exception:
        sentences = [s.strip() for s in text.split(".") if s.strip()]
    return [s.strip() for s in sentences if len(s.split()) >= _MIN_SENTENCE_WORDS]


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


def _make_mcq(sentence: str, term: str, distractor_pool: list[str], topic: str) -> dict | None:
    if term.lower() not in sentence.lower():
        return None
    blanked = _replace_case_insensitive(sentence, term, "_____")
    distractors = [d for d in distractor_pool if d.lower() != term.lower()]
    random.shuffle(distractors)
    distractors = distractors[:3]
    while len(distractors) < 3:
        distractors.append(f"{term} (alternate)")
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
    }


def _replace_case_insensitive(text: str, target: str, replacement: str) -> str:
    idx = text.lower().find(target.lower())
    if idx == -1:
        return text
    return text[:idx] + replacement + text[idx + len(target):]


def _make_true_false(sentence: str, topic: str, negate: bool) -> dict:
    if negate:
        negated = _negate_sentence(sentence)
        return {
            "question_type": "true_false",
            "topic": topic,
            "question_text": negated,
            "options": ["True", "False"],
            "correct_answer": "False",
        }
    return {
        "question_type": "true_false",
        "topic": topic,
        "question_text": sentence,
        "options": ["True", "False"],
        "correct_answer": "True",
    }


def _negate_sentence(sentence: str) -> str:
    for positive, negative in (("is", "is not"), ("are", "are not"), ("can", "cannot"), ("will", "will not")):
        if f" {positive} " in f" {sentence} ":
            return sentence.replace(f" {positive} ", f" {negative} ", 1)
    return f"It is not true that {sentence[0].lower()}{sentence[1:]}"


def _make_scenario(sentence: str, term: str, distractor_pool: list[str], topic: str) -> dict:
    base_mcq = _make_mcq(sentence, term, distractor_pool, topic)
    question_text = (
        f"A trainee encounters the following situation related to {topic}: {sentence} "
        "What is the most appropriate understanding of this scenario?"
    )
    if base_mcq:
        base_mcq["question_type"] = "scenario"
        base_mcq["question_text"] = question_text
        return base_mcq
    return {
        "question_type": "scenario",
        "topic": topic,
        "question_text": question_text,
        "options": None,
        "correct_answer": term,
    }


def _make_descriptive(sentence: str, term: str, topic: str) -> dict:
    return {
        "question_type": "descriptive",
        "topic": topic,
        "question_text": f"Explain '{term}' in the context of {topic}, referencing the relevant course material.",
        "options": None,
        "correct_answer": sentence,
    }


def generate_questions_from_content(context_text: str, question_types: list[str], count: int, topic: str = _DEFAULT_TOPIC) -> list[dict]:
    sentences = _split_sentences(context_text)
    if not sentences:
        sentences = [context_text.strip()] if context_text.strip() else []
    if not sentences:
        return []

    key_terms = _extract_key_terms(context_text) or _extract_entities(context_text)
    if not key_terms:
        key_terms = [s.split()[0] for s in sentences[:5]]

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

        sentence = _sentence_for_term(sentences, term) or sentences[sentence_idx % len(sentences)]
        sentence_idx += 1

        question: dict | None = None
        if q_type == "mcq":
            question = _make_mcq(sentence, term, key_terms, topic)
        elif q_type == "true_false":
            question = _make_true_false(sentence, topic, negate=bool(len(questions) % 2))
        elif q_type == "scenario":
            question = _make_scenario(sentence, term, key_terms, topic)
        elif q_type == "descriptive":
            question = _make_descriptive(sentence, term, topic)

        if question:
            questions.append(question)

    return questions
