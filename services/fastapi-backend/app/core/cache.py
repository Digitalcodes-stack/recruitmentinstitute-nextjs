from functools import lru_cache

import redis.asyncio as redis

from app.core.config import settings


@lru_cache
def get_redis_url() -> str:
    return settings.redis_broker_url or settings.redis_url or "redis://localhost:6379/0"


@lru_cache
def get_blacklist_url() -> str:
    if settings.redis_broker_url:
        return settings.redis_broker_url.rsplit("/", 1)[0] + f"/{settings.redis_blacklist_db}"
    if settings.redis_url:
        return settings.redis_url.rsplit("/", 1)[0] + f"/{settings.redis_blacklist_db}"
    return f"redis://localhost:6379/{settings.redis_blacklist_db}"


def create_redis_client(db_url: str | None = None) -> redis.Redis:
    return redis.from_url(db_url or get_redis_url(), decode_responses=True)

