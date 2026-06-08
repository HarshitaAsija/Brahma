from fastapi import FastAPI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Include API routers here when they are created
# app.include_router(api_router, prefix=settings.API_V1_STR)

logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")