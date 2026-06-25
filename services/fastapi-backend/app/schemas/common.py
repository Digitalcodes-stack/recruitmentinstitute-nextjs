from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = Field(default="Operation completed successfully")
    data: T
    model_config = ConfigDict(extra="forbid")


class SuccessResponse(BaseResponse[T], Generic[T]):
    pass


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int
    model_config = ConfigDict(extra="forbid")


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = Field(default="Data fetched successfully")
    data: list[T]
    pagination: PaginationMeta
    model_config = ConfigDict(extra="forbid")


class ErrorResponse(BaseModel):
    success: bool = False
    message: str = "Validation failed"
    errors: dict[str, object] | list[object] | str | None = None
    model_config = ConfigDict(extra="forbid")


class ResponseEnvelope(BaseResponse[T], Generic[T]):
    pass
