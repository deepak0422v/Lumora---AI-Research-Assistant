import shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter
from app.services.vector_store import (
    load_vector_store,
    embeddings,
    VECTOR_DB_PATH
)
from app.services.db import db_list_documents, db_delete_document
from langchain_community.vectorstores import FAISS

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("")
def list_documents(session_id: Optional[str] = None):
    return db_list_documents(session_id)

@router.delete("/{filename}")
async def delete_document(filename: str, session_id: Optional[str] = None):
    # Locate files matching filename under session_id folder or global folder
    if session_id:
        file_path = Path(f"data/raw_docs/{session_id}/{filename}")
    else:
        file_path = Path(f"data/raw_docs/{filename}")

    if file_path.exists():
        file_path.unlink()
        # Clean up empty session directory
        if session_id:
            session_dir = file_path.parent
            try:
                if session_dir.exists() and not any(session_dir.iterdir()):
                    session_dir.rmdir()
            except Exception:
                pass
        
    db_delete_document(filename, session_id)

    try:
        vector_store = load_vector_store()
        if vector_store:
            ids_to_delete = []
            for doc_id, doc in vector_store.docstore._dict.items():
                source = Path(doc.metadata.get("source", "")).name
                doc_session_id = doc.metadata.get("session_id")
                
                # Identify chunks matching filename and session_id
                if source.lower() == filename.lower() and (not session_id or doc_session_id == session_id):
                    ids_to_delete.append(doc_id)

            if ids_to_delete:
                vector_store.delete(ids_to_delete)
                # If no chunks left at all, clean up vector store folder
                if len(vector_store.docstore._dict) == 0:
                    shutil.rmtree(VECTOR_DB_PATH, ignore_errors=True)
                else:
                    vector_store.save_local(VECTOR_DB_PATH)
    except Exception as e:
        print(f"Error updating vector store for deleted file {filename}: {e}")

    return {"message": f"{filename} deleted successfully"}