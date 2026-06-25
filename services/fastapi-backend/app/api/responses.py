from math import ceil
from fastapi.responses import JSONResponse


def success_response(data: object, message: str = "Operation completed successfully", status_code: int = 200) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": True, "message": message, "data": data})


def paginated_response(data: list[object], page: int, per_page: int, total: int, message: str = "Data fetched successfully") -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": ceil(total / per_page) if per_page else 0,
            },
        },
    )


def error_response(message: str, errors: object = None, status_code: int = 400) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": False, "message": message, "errors": errors})
