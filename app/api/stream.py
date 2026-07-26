import json
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.query import QueryRequest
from app.services.retriever import retrieve_documents
from app.services.generator import stream_answer
from app.services.memory import get_conversation_history, save_message
from app.services.context_builder import build_context
from app.services.retrieval_utils import format_sources

router = APIRouter()

@router.post("/stream")
def stream_chat(request: QueryRequest):
    history = get_conversation_history(request.session_id)
    results = retrieve_documents(request.question, request.session_id)

    if not results:
        retrieved_context = "No relevant documents found. Answer using general knowledge."
    else:
        retrieved_context = "\n\n".join(
            f"[{idx + 1}] Source: {Path(doc.metadata.get('source', '')).name} (Page {doc.metadata.get('page', 'N/A')})\nContent:\n{doc.page_content}"
            for idx, doc in enumerate(results)
        )

    context = build_context(history, retrieved_context)
    sources = format_sources(results)

    def generate():
        # Yield metadata first (sources formatted as SSE event)
        metadata = {"sources": sources}
        yield f"data: {json.dumps(metadata)}\n\n"

        full_response = ""
        for chunk in stream_answer(context=context, question=request.question):
            full_response += chunk
            payload = {"content": chunk}
            yield f"data: {json.dumps(payload)}\n\n"

        # Save to SQLite database after streaming completes
        save_message(request.session_id, "user", request.question)
        save_message(request.session_id, "assistant", full_response, sources=sources)
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")