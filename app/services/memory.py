import uuid
from typing import List, Dict, Any
from app.services.db import db_save_message, db_get_messages

def save_message(session_id: str, role: str, content: str, sources: List[Dict[str, Any]] = None):
    msg_id = str(uuid.uuid4())
    db_save_message(msg_id, session_id, role, content, sources)

def get_conversation_history(session_id: str) -> str:
    messages = db_get_messages(session_id)
    formatted_history = []
    for msg in messages:
        formatted_history.append(f"{msg['role'].upper()}: {msg['content']}")
    return "\n".join(formatted_history)

def get_session_messages(session_id: str) -> List[Dict[str, Any]]:
    return db_get_messages(session_id)