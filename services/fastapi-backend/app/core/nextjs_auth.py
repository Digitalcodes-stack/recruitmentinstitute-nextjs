from dataclasses import dataclass

from jose import jwt, JWTError

from app.core.config import settings
from app.core.exceptions import ServiceError


@dataclass
class Principal:
    user_id: int
    email: str
    name: str
    role: str
    type: str  # one of: admin | student | membership | candidate | community | trainer


def decode_nextjs_token(token: str) -> Principal:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ServiceError("Invalid token", 401) from exc

    try:
        return Principal(
            user_id=int(payload["userId"]),
            email=str(payload["email"]),
            name=str(payload["name"]),
            role=str(payload["role"]),
            type=str(payload["type"]),
        )
    except (KeyError, ValueError) as exc:
        raise ServiceError("Invalid token claims", 401) from exc
