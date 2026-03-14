from fastapi.responses import JSONResponse
from typing import Any, Optional

def success_response(data: Any = None, message: str = "Success", status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )

def error_response(message: str = "Error", detail: Any = None, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "detail": detail
        }
    )
