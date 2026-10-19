
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.user.router import router as user_router
from src.tasks.router import router as tasks_router
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Talerang Campus Ambassador API",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://avs-cmd.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(tasks_router)


@app.get("/")
def home():
    return {
        "message": "Talerang Campus Ambassador API is running"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
