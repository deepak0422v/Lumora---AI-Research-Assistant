from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

VECTOR_DB_PATH = "data/vector_store"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

embeddings = HuggingFaceEmbeddings(
    model_name=MODEL_NAME,
    model_kwargs={"local_files_only": True}
)

def create_metadata(chunks, source_name):
    metadatas = []
    for idx, chunk in enumerate(chunks):
        metadatas.append(
            {
                "source": source_name,
                "chunk_id": idx,
                "page": chunk["page"]   # ← comma was missing above
            }
        )
    return metadatas

def create_or_load_vector_store():
    faiss_file = Path(VECTOR_DB_PATH) / "index.faiss"
    pkl_file = Path(VECTOR_DB_PATH) / "index.pkl"
    if Path(VECTOR_DB_PATH).exists() and pkl_file.exists():
        return FAISS.load_local(
            VECTOR_DB_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
    return None

def add_documents_to_vector_store(chunks,source_name):
    metadatas = create_metadata(chunks,source_name)
    texts = [
        chunk["content"]   
        for chunk in chunks
    ]
    existing_vector_store = (create_or_load_vector_store())
    if existing_vector_store:
        existing_vector_store.add_texts(
            texts=texts,
            metadatas=metadatas
        )
        vector_store = existing_vector_store
    else:
        vector_store = FAISS.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas
        )
    vector_store.save_local(VECTOR_DB_PATH)
    return vector_store

def load_vector_store():
    if not Path(VECTOR_DB_PATH).exists():
        return None
    return FAISS.load_local(
        VECTOR_DB_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )