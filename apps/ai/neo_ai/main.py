from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from neo_ai.routers import embeddings, answer, health

app = FastAPI(title="Neo Commerce AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(embeddings.router)
app.include_router(answer.router)
