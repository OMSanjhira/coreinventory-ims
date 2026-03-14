from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import time
import logging
from utils.response_wrapper import error_response

logger = logging.getLogger("api")

def setup_middleware(app: FastAPI):
    @app.middleware("http")
    async def catch_exceptions_middleware(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(f"Global exception caught: {exc}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"detail": "An internal server error occurred", "message": str(exc)},
            )

    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Validation error: {exc.errors()}")
        return error_response(
            message="Validation failed",
            detail=exc.errors(),
            status_code=422
        )
