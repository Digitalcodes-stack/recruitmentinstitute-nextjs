import asyncio
import re

from bs4 import BeautifulSoup, Tag

from app.services.ai.local_models import get_sentence_embedder


def _embed_sync(texts: list[str]) -> list[list[float]]:
    model = get_sentence_embedder()
    vectors = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return vectors.tolist()


async def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    return await asyncio.to_thread(_embed_sync, texts)


_BLOCK_CLOSING_TAGS = re.compile(r"</(p|li|h[1-6]|div|tr|blockquote)\s*>", re.IGNORECASE)
_BREAK_TAGS = re.compile(r"<br\s*/?>", re.IGNORECASE)


def strip_html(html: str | None) -> str:
    """Strip HTML while preserving sentence boundaries: block-level closing
    tags (</p>, </li>, </h1>-</h6>, etc.) and <br> become a period, so the
    output has real sentence breaks for nltk.sent_tokenize instead of
    collapsing into one run-on sentence with no punctuation."""
    if not html:
        return ""
    text = _BREAK_TAGS.sub(". ", html)
    text = _BLOCK_CLOSING_TAGS.sub(". ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return re.sub(r"\s*\.\s*\.", ".", text)


_HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
_LIST_TAGS = {"ul", "ol"}
_MIN_BULLET_WORDS_TO_STAND_ALONE = 6


def _is_heading_like(tag: Tag) -> bool:
    """A <p><strong>...</strong></p> (or empty equivalent) acting as a
    heading, or a real heading tag — the pattern this course content
    actually uses for module titles."""
    if tag.name in _HEADING_TAGS:
        return True
    if tag.name == "p":
        children = [c for c in tag.children if isinstance(c, Tag) or str(c).strip()]
        return len(children) == 1 and isinstance(children[0], Tag) and children[0].name in ("strong", "b")
    return False


def extract_semantic_blocks(html: str | None) -> list[str]:
    """Group an outline-style document (heading followed by a bullet list)
    into one semantic block per heading, e.g.:

        Module 5: Recruitment Strategies
        Topics:
        - Conducting Effective Interviews
        - Candidate Screening

    instead of treating "Conducting Effective Interviews" as an orphaned
    2-4 word fragment with no context. Falls back to returning the
    stripped plain-text paragraphs (via strip_html + sentence split happening
    downstream) when the document isn't in this heading+list shape, so
    prose-style content is unaffected.
    """
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    top_level = [child for child in soup.children if isinstance(child, Tag)]
    if not top_level:
        return []

    blocks: list[str] = []
    pending_heading: str | None = None
    pending_bullets: list[str] = []
    found_any_heading_list_pair = False

    def flush() -> None:
        nonlocal pending_heading, pending_bullets
        if pending_heading and pending_bullets:
            lines = [pending_heading, "Topics:"] + [f"- {b}" for b in pending_bullets]
            blocks.append("\n".join(lines))
        elif pending_heading:
            blocks.append(pending_heading)
        elif pending_bullets:
            blocks.extend(pending_bullets)
        pending_heading = None
        pending_bullets = []

    for tag in top_level:
        text = tag.get_text(" ", strip=True)
        if not text:
            continue

        if _is_heading_like(tag):
            flush()
            pending_heading = text
        elif tag.name in _LIST_TAGS:
            items = [li.get_text(" ", strip=True) for li in tag.find_all("li") if li.get_text(strip=True)]
            if pending_heading:
                pending_bullets.extend(items)
                found_any_heading_list_pair = True
            else:
                # Bullets with no preceding heading: keep short ones grouped
                # together rather than emitting each as its own fragment.
                blocks.append("\n".join(f"- {item}" for item in items))
        else:
            flush()
            blocks.append(text)

    flush()
    return blocks if found_any_heading_list_pair else []


def chunk_text(text: str, max_chars: int = 2000, overlap_chars: int = 200) -> list[str]:
    text = text.strip()
    if not text:
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [text]

    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}" if current else paragraph
        if len(candidate) <= max_chars:
            current = candidate
            continue
        if current:
            chunks.append(current)
        if len(paragraph) <= max_chars:
            current = paragraph
        else:
            start = 0
            while start < len(paragraph):
                end = start + max_chars
                chunks.append(paragraph[start:end])
                start = end - overlap_chars if end < len(paragraph) else end
            current = ""

    if current:
        chunks.append(current)

    return chunks
