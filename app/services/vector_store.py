from pathlib import Path

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import settings

VECTOR_DB_PATH = "data/vector_store"
MODEL_NAME = "models/gemini-embedding-2"

# Lazy-loaded embedding model
_embeddings = None


def get_embeddings():
    global _embeddings

    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=MODEL_NAME,
            google_api_key=settings.GEMINI_API_KEY,
        )

    return _embeddings


def create_metadata(chunks, source_name, session_id=None):
    metadatas = []

    for idx, chunk in enumerate(chunks):
        metadatas.append(
            {
                "source": source_name,
                "chunk_id": idx,
                "page": chunk["page"],
                "session_id": session_id,
            }
        )

    return metadatas


def create_or_load_vector_store():
    faiss_file = Path(VECTOR_DB_PATH) / "index.faiss"
    pkl_file = Path(VECTOR_DB_PATH) / "index.pkl"

    if (
        Path(VECTOR_DB_PATH).exists()
        and faiss_file.exists()
        and pkl_file.exists()
    ):
        return FAISS.load_local(
            VECTOR_DB_PATH,
            get_embeddings(),
            allow_dangerous_deserialization=True,
        )

    return None


def add_documents_to_vector_store(chunks, source_name, session_id=None):
    metadatas = create_metadata(chunks, source_name, session_id)

    texts = [
        chunk["content"]
        for chunk in chunks
    ]

    existing_vector_store = create_or_load_vector_store()

    if existing_vector_store:
        existing_vector_store.add_texts(
            texts=texts,
            metadatas=metadatas,
        )
        vector_store = existing_vector_store
    else:
        vector_store = FAISS.from_texts(
            texts=texts,
            embedding=get_embeddings(),
            metadatas=metadatas,
        )

    Path(VECTOR_DB_PATH).mkdir(parents=True, exist_ok=True)
    vector_store.save_local(VECTOR_DB_PATH)

    return vector_store


_vector_store = None
_last_loaded_mtime = 0


def load_vector_store():
    global _vector_store, _last_loaded_mtime
    import os
    faiss_file = Path(VECTOR_DB_PATH) / "index.faiss"
    pkl_file = Path(VECTOR_DB_PATH) / "index.pkl"

    if not (
        Path(VECTOR_DB_PATH).exists()
        and faiss_file.exists()
        and pkl_file.exists()
    ):
        _vector_store = None
        _last_loaded_mtime = 0
        return None

    try:
        current_mtime = os.path.getmtime(str(faiss_file))
    except OSError:
        current_mtime = 0

    if _vector_store is not None and current_mtime == _last_loaded_mtime:
        return _vector_store

    _vector_store = FAISS.load_local(
        VECTOR_DB_PATH,
        get_embeddings(),
        allow_dangerous_deserialization=True,
    )
    _last_loaded_mtime = current_mtime
    return _vector_store