import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import chat

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Conversational AI Backend for Cyber Fraud Reporting with Groq Low-Latency Llama 3.3 Inference",
    version=settings.VERSION
)

# Configure CORS so Next.js or React frontends can securely connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all local dev origins, easy for prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local static directory to serve generated PDF reports directly
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)
app.mount("/static/reports", StaticFiles(directory=REPORTS_DIR), name="static")

# Include the modular chat router
app.include_router(chat.router)

@app.get("/")
def read_root():
    """
    Health check endpoint to verify backend status and dependencies.
    """
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "groq_status": "configured" if settings.GROQ_API_KEY else "missing_key",
        "model_configured": settings.GROQ_MODEL
    }
