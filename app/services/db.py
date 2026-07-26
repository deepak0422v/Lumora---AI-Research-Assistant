import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path("data/lumora.db")

def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            sources_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
        )
    """)
    
    # Documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

# Session DB Helpers
def db_list_sessions() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_create_session(session_id: str, title: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        (session_id, title)
    )
    conn.commit()
    conn.close()
    return {"id": session_id, "title": title}

def db_get_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, created_at, updated_at FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_update_session_title(session_id: str, title: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (title, session_id)
    )
    conn.commit()
    conn.close()

def db_delete_session(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM documents WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

# Message DB Helpers
def db_save_message(message_id: str, session_id: str, role: str, content: str, sources: Optional[List[Dict[str, Any]]] = None):
    conn = get_connection()
    cursor = conn.cursor()
    sources_json = json.dumps(sources) if sources else None
    
    # Ensure session exists and update title if "New exploration"
    cursor.execute("SELECT id, title FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    if not row:
        title = content[:35] + "..." if len(content) > 35 else content
        cursor.execute(
            "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            (session_id, title if title else "New exploration")
        )
    else:
        existing_title = dict(row).get("title", "")
        if role == "user" and (existing_title == "New exploration" or not existing_title):
            new_title = content[:35] + "..." if len(content) > 35 else content
            cursor.execute("UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_title, session_id))
        else:
            cursor.execute("UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))

    cursor.execute(
        "INSERT INTO messages (id, session_id, role, content, sources_json, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        (message_id, session_id, role, content, sources_json)
    )
    conn.commit()
    conn.close()

def db_get_messages(session_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, session_id, role, content, sources_json, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for r in rows:
        item = dict(r)
        if item["sources_json"]:
            try:
                item["sources"] = json.loads(item["sources_json"])
            except Exception:
                item["sources"] = []
        else:
            item["sources"] = []
        del item["sources_json"]
        messages.append(item)
    return messages

# Document DB Helpers
def db_save_document(doc_id: str, filename: str, file_path: str, file_size: str, session_id: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO documents (id, session_id, filename, file_path, file_size, uploaded_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        (doc_id, session_id, filename, file_path, file_size)
    )
    conn.commit()
    conn.close()

def db_list_documents(session_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if session_id:
        cursor.execute("SELECT id, session_id, filename, file_path, file_size, uploaded_at FROM documents WHERE session_id = ? ORDER BY uploaded_at DESC", (session_id,))
    else:
        cursor.execute("SELECT id, session_id, filename, file_path, file_size, uploaded_at FROM documents ORDER BY uploaded_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_delete_document(filename: str, session_id: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    if session_id:
        cursor.execute("DELETE FROM documents WHERE filename = ? AND session_id = ?", (filename, session_id))
    else:
        cursor.execute("DELETE FROM documents WHERE filename = ?", (filename,))
    conn.commit()
    conn.close()
