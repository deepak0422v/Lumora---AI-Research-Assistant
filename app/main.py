from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.report import router as report_router
from app.config import settings
from app.api.document import router as document_router
from app.api.upload import router as upload_router
from app.api.ask import router as ask_router
from app.api.stream import router as stream_router
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Lumora - Clarity from Complexity"
)

app.mount(
    "/raw_docs",
    StaticFiles(directory="data/raw_docs"),
    name="raw_docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(ask_router)
app.include_router(stream_router)
app.include_router(document_router)
app.include_router(report_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to Lumora API",
        "version": settings.VERSION
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME
    }