from pathlib import Path
import shutil
from fastapi import APIRouter
from app.services.vector_store import (
    load_vector_store,
    embeddings,
    VECTOR_DB_PATH
)
from langchain_community.vectorstores import FAISS

router = APIRouter()

@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    file_path = Path(
        f"data/raw_docs/{filename}"
    )
    if file_path.exists():
        file_path.unlink()
    try:
        vector_store = load_vector_store()
        docs = vector_store.docstore._dict
        remaining_texts = []
        remaining_metadata = []
        for _, doc in docs.items():
            source = doc.metadata.get(
                "source"
            )
            if source != filename:
                remaining_texts.append(
                    doc.page_content
                )
                remaining_metadata.append(
                    doc.metadata
                )

        # if nothing remains
        if not remaining_texts:
            shutil.rmtree(
                VECTOR_DB_PATH,
                ignore_errors=True
            )
        else:
            new_store = FAISS.from_texts(
                texts=remaining_texts,
                embedding=embeddings,
                metadatas=remaining_metadata
            )
            new_store.save_local(
                VECTOR_DB_PATH
            )
    except:
        pass
    return {
        "message":
        f"{filename} deleted successfully"
    }