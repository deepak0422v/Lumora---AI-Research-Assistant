import uuid
import re
import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.vector_store import add_documents_to_vector_store
from app.services.db import db_save_document, get_connection

router = APIRouter(tags=["upload"])

UPLOAD_DIR = Path("data/raw_docs")

def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    # 1. Enforce only PDF files are supported
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # 2. Sanitize filename to prevent path traversal
    # Replace non-alphanumeric (except dots, dashes, underscores) with underscore
    sanitized_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
    filename = os.path.basename(sanitized_name)
    if not filename or filename == "." or filename == "..":
        raise HTTPException(status_code=400, detail="Invalid PDF filename.")

    # 3. Prevent duplicates within the same session
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required to upload a document.")
        
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM documents WHERE filename = ? AND session_id = ?", (filename, session_id))
        exists = cursor.fetchone()
        conn.close()
    except Exception as db_err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(db_err)}")

    if exists:
        raise HTTPException(status_code=400, detail=f"A document named '{filename}' already exists in this session.")

    # 4. Check for empty files (0 bytes)
    try:
        content = await file.read()
    except Exception as read_err:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(read_err)}")
        
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    # 5. Create session-partitioned folder and write file to disk
    session_dir = UPLOAD_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    file_path = session_dir / filename

    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as write_err:
        raise HTTPException(status_code=500, detail=f"Failed to write file to disk: {str(write_err)}")

    # 6. Extract text and validate PDF integrity (reject corrupt/empty PDFs)
    try:
        text_pages = extract_text_from_pdf(str(file_path))
        total_text = "".join(p["text"] for p in text_pages).strip()
        if not total_text:
            raise ValueError("PDF has no extractable text or is image-only.")
    except Exception as pdf_err:
        # Graceful cleanup of disk file
        file_path.unlink(missing_ok=True)
        try:
            if not any(session_dir.iterdir()):
                session_dir.rmdir()
        except Exception:
            pass
        raise HTTPException(status_code=400, detail=f"Invalid, empty, or corrupt PDF file: {str(pdf_err)}")

    # 7. Chunk text and index into vector database
    try:
        chunks = chunk_text(text_pages)
        add_documents_to_vector_store(
            chunks=chunks,
            source_name=filename,
            session_id=session_id
        )
    except Exception as index_err:
        # Graceful cleanup of disk file
        file_path.unlink(missing_ok=True)
        try:
            if not any(session_dir.iterdir()):
                session_dir.rmdir()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to index document chunks: {str(index_err)}")

    # 8. Save metadata record to SQLite DB only after successful indexing
    doc_id = str(uuid.uuid4())
    file_size_formatted = format_file_size(len(content))
    try:
        db_save_document(
            doc_id=doc_id,
            filename=filename,
            file_path=str(file_path),
            file_size=file_size_formatted,
            session_id=session_id
        )
    except Exception as db_save_err:
        # Cleanup file on disk
        file_path.unlink(missing_ok=True)
        try:
            if not any(session_dir.iterdir()):
                session_dir.rmdir()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to save document metadata: {str(db_save_err)}")

    return {
        "id": doc_id,
        "filename": filename,
        "file_size": file_size_formatted,
        "session_id": session_id,
        "message": f"{filename} uploaded and indexed successfully."
    }