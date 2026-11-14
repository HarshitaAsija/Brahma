import logging
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)
# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ingestion router
from app.api.routers.ingestion_router import router as ingestion_router

app.include_router(ingestion_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
async def root():
    demo_page = Path(__file__).resolve().parents[2] / "frontend" / "demo" / "index.html"
    return FileResponse(demo_page)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
