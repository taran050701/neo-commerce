from __future__ import annotations

from pathlib import Path
from typing import List

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from neo_ai.models.schemas import RetrievalHit
from neo_ai.services.embedding import embed_texts

DATA_DIR = Path(__file__).resolve().parent.parent / 'data'
FAQ_PATH = DATA_DIR / 'faqs.csv'


class HybridRetriever:
    def __init__(self, frame: pd.DataFrame):
        self.frame = frame.fillna("")
        self.corpus = (self.frame['question'] + ' \n' + self.frame['answer']).tolist()
        self.embeddings = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    async def search(self, query: str, k: int = 5) -> List[RetrievalHit]:
        if self.embeddings is None:
            self.embeddings = await embed_texts(self.corpus)
        query_embedding = (await embed_texts([query]))[0]
        embedding_scores = cosine_similarity([query_embedding], self.embeddings)[0]
        tfidf_vec = self.vectorizer.transform([query])
        tfidf_scores = (tfidf_vec @ self.tfidf_matrix.T).toarray()[0]
        scores = 0.6 * embedding_scores + 0.4 * tfidf_scores
        ranked_indices = scores.argsort()[::-1][:k]
        hits: List[RetrievalHit] = []
        for idx in ranked_indices:
            row = self.frame.iloc[int(idx)]
            hits.append(
                RetrievalHit(
                    id=str(row.get('id', idx)),
                    question=row.get('question', ''),
                    answer=row.get('answer', ''),
                    category=row.get('category'),
                    score=float(scores[int(idx)]),
                )
            )
        return hits


async def default_retriever() -> HybridRetriever:
    if not FAQ_PATH.exists():
        FAQ_PATH.parent.mkdir(parents=True, exist_ok=True)
        FAQ_PATH.write_text('id,question,answer,category\n1,What is Neo Commerce?,A futuristic store,overview\n')
    frame = pd.read_csv(FAQ_PATH)
    return HybridRetriever(frame)
