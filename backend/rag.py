import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = []

import re


def chunk_text(text, max_sentences=1):
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    for i in range(0, len(sentences), max_sentences):
        chunk = " ".join(sentences[i : i + max_sentences])
        chunks.append(chunk)
    return chunks


def add_document(text):
    chunks = chunk_text(text)
    for chunk in chunks:
        embedding = model.encode(chunk)
        documents.append({"text": chunk, "embedding": embedding})


def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


def retrieve_similar_chunks(query, top_k=3):
    query_embedding = model.encode(query)
    similarities = []
    for doc in documents:
        sim = cosine_similarity(query_embedding, doc["embedding"])
        similarities.append((sim, doc["text"]))
        similarities.sort(reverse=True, key=lambda x: x[0])
    return [chunk for _, chunk in similarities[:top_k]]


def generate_answer(question, context_chunks):

    answer = "Based on the document, here is the answer: "
    answer += " ".join(context_chunks)
    return answer


def answer_query(query):
    similar_chunks = retrieve_similar_chunks(query)
    keyword = query.lower().split()[-1]

    filtered_sentences = set()

    for chunk in similar_chunks:
        sentences = chunk.split(".")
        for sentence in sentences:
            if keyword in sentence.lower():
                filtered_sentences.add(sentence.strip())

    if not filtered_sentences:
        return "No specific information found.", similar_chunks

    answer = " ".join(filtered_sentences)
    return answer, similar_chunks
