from fastapi import APIRouter, HTTPException

from neo_ai.models.schemas import AnswerRequest, AnswerResponse
from neo_ai.services.pipeline import build_answer

router = APIRouter(prefix="/answer", tags=["assistant"])

@router.post("/", response_model=AnswerResponse)
async def answer(payload: AnswerRequest):
    try:
        result = await build_answer(payload)
        return result
    except RuntimeError as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=503, detail=str(exc)) from exc
