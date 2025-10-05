from functools import lru_cache
from typing import List

import numpy as np

MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'

try:  # pragma: no cover - optional heavy import
    from sentence_transformers import SentenceTransformer
except ImportError:  # pragma: no cover
    SentenceTransformer = None


@lru_cache(maxsize=1)
def get_model():  # pragma: no cover
    if SentenceTransformer is None:
        raise RuntimeError('sentence-transformers not installed')
    return SentenceTransformer(MODEL_NAME)


async def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return np.asarray(embeddings).tolist()
