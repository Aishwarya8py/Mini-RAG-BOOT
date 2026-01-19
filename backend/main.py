from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import add_document, answer_query, generate_answer, retrieve_similar_chunks

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class uploadRequest(BaseModel):
    text: str


class queryRequest(BaseModel):
    query: str


@app.post("/upload")
def upload_document(request: uploadRequest):
    add_document(request.text)
    return {"status": "Document uploaded and processed successfully."}


@app.post("/query")
def query_document(request: queryRequest):
    relevant_chunks = retrieve_similar_chunks(request.query)
    answer = generate_answer(request.query, relevant_chunks)

    return {"question": request.query, "answer": answer, "sources": relevant_chunks}
