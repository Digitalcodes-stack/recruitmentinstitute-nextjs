import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.responses import error_response

logger = logging.getLogger(__name__)


class ServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ServiceError)
    async def service_error_handler(_request: Request, exc: ServiceError):
        return error_response(exc.message, status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_request: Request, exc: RequestValidationError):
        return error_response("Validation failed", errors=exc.errors(), status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    @app.exception_handler(HTTPException)
    async def http_error_handler(_request: Request, exc: HTTPException):
        message = str(exc.detail) if exc.detail else "Request failed"
        return error_response(message, status_code=exc.status_code)

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(_request: Request, exc: SQLAlchemyError):
        logger.exception("Database error", exc_info=exc)
        return error_response("Database error", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @app.exception_handler(Exception)
    async def unhandled_error_handler(_request: Request, exc: Exception):
        logger.exception("Unhandled error", exc_info=exc)
        return error_response("Internal server error", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
