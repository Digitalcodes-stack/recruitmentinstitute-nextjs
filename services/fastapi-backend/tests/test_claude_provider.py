import pytest
from unittest.mock import AsyncMock, MagicMock

from app.core.config import settings
from app.services.ai.base import TopicScore
from app.services.ai.providers.claude_provider import ClaudeProvider, ClaudeProviderError


@pytest.mark.anyio
async def test_claude_provider_requires_api_key(monkeypatch):
    monkeypatch.setattr(settings, "claude_api_key", None)
    provider = ClaudeProvider()
    with pytest.raises(ClaudeProviderError, match="CLAUDE_API_KEY"):
        provider._get_client()


@pytest.mark.anyio
async def test_claude_provider_mock_generate_questions(monkeypatch):
    monkeypatch.setattr(settings, "claude_api_key", "mock-key")
    provider = ClaudeProvider()

    mock_client = AsyncMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text='{"questions": [{"question_type": "mcq", "topic": "HR", "question_text": "Sample?", "options": ["A", "B", "C", "D"], "correct_answer": "A"}]}')]
    mock_client.messages.create.return_value = mock_response
    provider._client = mock_client

    result = await provider.generate_questions("Course context", ["mcq"], 1)
    assert len(result) == 1
    assert result[0]["question_text"] == "Sample?"
