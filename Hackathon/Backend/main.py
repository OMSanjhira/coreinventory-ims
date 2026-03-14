from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from core.config import settings
from core.limiter import limiter
from core.middleware import setup_middleware
from core.openapi import setup_openapi
from routers.v1 import v1_router

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

def create_app() -> FastAPI:
    app = FastAPI(title="Hackathon Generic API")
    
    # Rate Limiter Setup
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Middleware and Global Exception Handlers
    setup_middleware(app)
    
    # CORS Configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include Routers
    app.include_router(v1_router, prefix="/api/v1")
    
    # Finalize OpenAPI setup
    setup_openapi(app)
    
    return app

app = create_app()

@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "alive", 
        "template": "generic-fastapi-hackathon",
        "docs": "/docs"
    }