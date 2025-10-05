# Neo Commerce AI Service

FastAPI microservice that delivers embeddings, hybrid retrieval, and grounded assistant answers.

## Local Dev
```bash
cd apps/ai
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn neo_ai.main:app --reload --port 8000
```

## Endpoints
- `GET /health` – service heartbeat
- `POST /embed` – returns MiniLM embeddings for given texts
- `POST /answer` – hybrid FAQ retrieval + response builder

## Environment
Create `.env` if needed for future feature flags (LLM provider, reranker toggles). Currently uses default CSV knowledge base in `neo_ai/data/faqs.csv`.

## TODO
- Integrate cross-encoder reranking
- Add sentiment analysis endpoint
- Connect to Postgres for KB embeddings
- Mirror Streamlit MVP ticket logging
