from fastapi import APIRouter

from neo_ai.models.schemas import EmbedRequest, EmbedResponse
from neo_ai.services.embedding import embed_texts

router = APIRouter(prefix="/embed", tags=["embeddings"])

@router.post("/", response_model=EmbedResponse)
async def create_embeddings(payload: EmbedRequest):
    vectors = await embed_texts(payload.texts)
    return EmbedResponse(embeddings=vectors)
