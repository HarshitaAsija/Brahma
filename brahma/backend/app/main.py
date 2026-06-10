from fastapi import FastAPI
from app.core.config import settings
import logging

from app.api.routers.paper_router import router as paper_router
from app.api.routers.gene_router import router as gene_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(paper_router, prefix=settings.API_V1_STR)
app.include_router(gene_router, prefix=settings.API_V1_STR)

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

logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")