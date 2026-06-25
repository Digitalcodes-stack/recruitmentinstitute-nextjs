from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ServiceError
from app.core.cache import create_redis_client, get_blacklist_url
from app.core.nextjs_auth import decode_nextjs_token, Principal
from app.db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)


async def get_db_session() -> AsyncSession:
    async for session in get_db():
        yield session


def _decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as exc:
        raise ServiceError("Invalid token", 401) from exc


@dataclass
class TokenContext:
    user_id: int
    role: str
    token_type: str
    jti: str | None = None


async def get_token_context(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]) -> TokenContext:
    if not credentials:
        raise ServiceError("Authorization token required", 401)
    payload = _decode_token(credentials.credentials)
    jti = str(payload.get("jti", ""))
    if jti:
        redis_client = create_redis_client(get_blacklist_url())
        if await redis_client.get(f"blacklist:{jti}"):
            raise ServiceError("Token has been revoked", 401)
    return TokenContext(
        user_id=int(payload["sub"]),
        role=str(payload.get("role", "")),
        token_type=str(payload.get("type", "access")),
        jti=str(payload.get("jti")) if payload.get("jti") else None,
    )


def require_roles(*roles: str):
    async def checker(ctx: Annotated[TokenContext, Depends(get_token_context)]) -> TokenContext:
        if ctx.role not in roles:
            raise ServiceError("Forbidden", 403)
        return ctx

    return checker


async def get_current_principal(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]) -> Principal:
    if not credentials:
        raise ServiceError("Authorization token required", 401)
    return decode_nextjs_token(credentials.credentials)


def require_principal_types(*types: str):
    async def checker(principal: Annotated[Principal, Depends(get_current_principal)]) -> Principal:
        if principal.type not in types:
            raise ServiceError("Forbidden", 403)
        return principal

    return checker
