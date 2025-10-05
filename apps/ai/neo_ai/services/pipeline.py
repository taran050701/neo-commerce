from neo_ai.models.schemas import AnswerRequest, AnswerResponse
from neo_ai.services.retriever import default_retriever


async def build_answer(payload: AnswerRequest) -> AnswerResponse:
    retriever = await default_retriever()
    hits = await retriever.search(payload.query)
    top_answer = hits[0].answer if hits else 'No relevant answer found.'

    reply = top_answer
    sentiment = None
    ticket_id = None

    # TODO: integrate optional sentiment / ticket creation hooks.

    return AnswerResponse(reply=reply, mode=payload.mode, hits=hits, sentiment=sentiment, ticket_id=ticket_id, fallback=False)
