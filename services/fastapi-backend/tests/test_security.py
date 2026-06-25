from jose import jwt

from app.core.config import settings
from app.core.nextjs_auth import decode_nextjs_token


def test_decode_nextjs_token_parses_expected_claims():
    token = jwt.encode(
        {
            "userId": 42,
            "email": "student@example.com",
            "name": "Test Student",
            "role": "EMPLOYEE",
            "type": "student",
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    principal = decode_nextjs_token(token)

    assert principal.user_id == 42
    assert principal.email == "student@example.com"
    assert principal.name == "Test Student"
    assert principal.role == "EMPLOYEE"
    assert principal.type == "student"
