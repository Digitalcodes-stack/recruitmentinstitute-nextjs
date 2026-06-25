"""Process-wide cached singleton loaders for local NLP/ML models.

Centralized here so embeddings.py, rag.py, local_ai_provider.py, and
question_generator.py all share one loaded copy of each model instead of
loading duplicates.
"""

from functools import lru_cache

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
SUMMARIZATION_MODEL_NAME = "sshleifer/distilbart-cnn-12-6"
SPACY_MODEL_NAME = "en_core_web_sm"


@lru_cache
def get_sentence_embedder():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(EMBEDDING_MODEL_NAME)


@lru_cache
def get_summarizer():
    from transformers import pipeline

    return pipeline("summarization", model=SUMMARIZATION_MODEL_NAME)


@lru_cache
def get_spacy_model():
    import spacy

    try:
        return spacy.load(SPACY_MODEL_NAME)
    except OSError:
        from spacy.cli import download

        download(SPACY_MODEL_NAME)
        return spacy.load(SPACY_MODEL_NAME)


@lru_cache
def get_keybert_model():
    from keybert import KeyBERT

    return KeyBERT(model=get_sentence_embedder())


_NLTK_RESOURCES = (
    ("tokenizers/punkt", "punkt"),
    ("tokenizers/punkt_tab", "punkt_tab"),
    ("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger"),
    ("taggers/averaged_perceptron_tagger_eng", "averaged_perceptron_tagger_eng"),
)


def ensure_nltk_data() -> None:
    import nltk

    for path, package in _NLTK_RESOURCES:
        try:
            nltk.data.find(path)
        except LookupError:
            try:
                nltk.download(package, quiet=True)
            except Exception:
                pass
