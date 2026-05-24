# stream.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.query import QueryRequest
from app.services.retriever import retrieve_documents
from app.services.generator import stream_answer
from app.services.memory import get_conversation_history, save_message
from app.services.context_builder import build_context  # ← shared builder

router = APIRouter()


@router.post("/stream")
def stream_chat(request: QueryRequest):

    history = get_conversation_history(request.session_id)  # ← was missing
    results = retrieve_documents(request.question)

    if not results:
        retrieved_context = "No relevant documents found. Answer using general knowledge."
    else:
        retrieved_context = "\n\n".join(
            f"Source: {doc.metadata.get('source')}\n\nContent:\n{doc.page_content}"
            for doc in results
        )

    context = build_context(history, retrieved_context)  # ← same rules as ask.py

    def generate():
        full_response = ""
        for chunk in stream_answer(context=context, question=request.question):
            full_response += chunk
            yield chunk
        # ← save to memory after streaming completes
        save_message(request.session_id, "user", request.question)
        save_message(request.session_id, "assistant", full_response)

    return StreamingResponse(generate(), media_type="text/plain")