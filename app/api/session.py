import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.db import (
    db_list_sessions,
    db_create_session,
    db_get_session,
    db_delete_session,
    db_update_session_title,
    db_get_messages
)
from app.services.vector_store import load_vector_store, VECTOR_DB_PATH

router = APIRouter(prefix="/sessions", tags=["sessions"])

class CreateSessionRequest(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "New exploration"

class UpdateSessionRequest(BaseModel):
    title: str

@router.get("")
def list_sessions():
    return db_list_sessions()

@router.post("")
def create_session(request: Optional[CreateSessionRequest] = None):
    session_id = request.id if request and request.id else str(uuid.uuid4())
    title = request.title if request and request.title else "New exploration"
    existing = db_get_session(session_id)
    if existing:
        return existing
    return db_create_session(session_id, title)

@router.get("/{session_id}")
def get_session(session_id: str):
    session = db_get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db_get_messages(session_id)
    return {**session, "messages": messages}

@router.put("/{session_id}")
def update_session(session_id: str, request: UpdateSessionRequest):
    session = db_get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db_update_session_title(session_id, request.title)
    return {"message": "Session updated successfully", "id": session_id, "title": request.title}

@router.delete("/{session_id}")
def delete_session(session_id: str):
    # 1. Clean up session files on disk
    session_dir = Path("data/raw_docs") / session_id
    if session_dir.exists():
        shutil.rmtree(session_dir, ignore_errors=True)

    # 2. Delete session chunks from FAISS vector store
    try:
        vector_store = load_vector_store()
        if vector_store:
            ids_to_delete = [
                doc_id for doc_id, doc in vector_store.docstore._dict.items()
                if doc.metadata.get("session_id") == session_id
            ]
            if ids_to_delete:
                vector_store.delete(ids_to_delete)
                if len(vector_store.docstore._dict) == 0:
                    shutil.rmtree(VECTOR_DB_PATH, ignore_errors=True)
                else:
                    vector_store.save_local(VECTOR_DB_PATH)
    except Exception as e:
        print(f"Error cleaning up vector store for deleted session {session_id}: {e}")

    # 3. Clean up DB records
    db_delete_session(session_id)
    return {"message": f"Session {session_id} deleted successfully"}

@router.get("/{session_id}/messages")
def get_session_messages_endpoint(session_id: str):
    return db_get_messages(session_id)
