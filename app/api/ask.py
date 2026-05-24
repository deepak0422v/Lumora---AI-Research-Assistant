# ask.py
from fastapi import APIRouter
from app.models.query import QueryRequest
from app.services.retriever import retrieve_documents
from app.services.generator import generate_answer
from app.services.retrieval_utils import evaluate_retrieval, format_sources
from app.services.memory import save_message, get_conversation_history
from app.services.context_builder import build_context  

router = APIRouter()

@router.post("/ask")
def ask_question(request: QueryRequest):
    history = get_conversation_history(request.session_id)
    results = retrieve_documents(request.question)
    if not results:
        retrieved_context = "No relevant documents found. Answer using general knowledge."
    else:
        retrieved_context = "\n\n".join(
            f"Source: {doc.metadata.get('source')}\n\nContent:\n{doc.page_content}"
            for doc in results
        )
    context = build_context(history, retrieved_context)  
    answer = generate_answer(context=context, question=request.question)
    save_message(request.session_id, "user", request.question)
    save_message(request.session_id, "assistant", answer)
    return {
        "question": request.question,
        "answer": answer,
        "sources": format_sources(results),
        "evaluation": evaluate_retrieval(request.question, results)
    }