from typing import List, Literal, Optional

from pydantic import BaseModel, Field

AssistantMode = Literal['faq', 'product', 'cart', 'returns']


class EmbedRequest(BaseModel):
    texts: List[str] = Field(default_factory=list)


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]


class RetrievalHit(BaseModel):
    id: str
    question: str
    answer: str
    score: float
    category: Optional[str]


class AnswerRequest(BaseModel):
    query: str
    mode: AssistantMode = 'faq'
    customer_id: Optional[str] = None
    cart_id: Optional[str] = None


class AnswerResponse(BaseModel):
    reply: str
    mode: AssistantMode
    hits: List[RetrievalHit]
    sentiment: Optional[str]
    ticket_id: Optional[str]
    fallback: bool = False
