from pathlib import Path
from app.config import settings

def compress_text(text: str, max_length: int = 180):
    cleaned = text.replace("\n", " ").strip()
    if len(cleaned) <= max_length:
        return cleaned
    return cleaned[:max_length] + "..."

def format_sources(documents):
    formatted_sources = []
    seen_sources = set()
    for doc in documents:
        source = doc.metadata.get("source")
        filename = Path(source).name
        if filename in seen_sources:
            continue
        formatted_sources.append({
            "source": filename,
            "chunk_id": doc.metadata.get("chunk_id"),
            "page": doc.metadata.get("page"),
            "snippet": compress_text(doc.page_content),
            
            
            "pdf_url": f"{settings.BACKEND_URL}/raw_docs/{filename}"
        })
        seen_sources.add(filename)
    return formatted_sources

def evaluate_retrieval(query, documents):
    evaluation = {
        "query": query,
        "total_chunks_retrieved": len(documents),
        "sources_used": [],
        "average_chunk_length": 0
    }
    total_length = 0
    unique_sources = set()
    for doc in documents:
        unique_sources.add(
            doc.metadata.get("source")
        )
        total_length += len(doc.page_content)
    evaluation["sources_used"] = list(unique_sources)
    if documents:
        evaluation["average_chunk_length"] = (
            total_length / len(documents)
        )
    return evaluation

def compress_documents(documents, max_chars=300):
    compressed_docs = []
    for doc in documents:
        content = doc.page_content.strip()
        compressed_content = content[:max_chars]
        if len(content) > max_chars:
            compressed_content += "..."
        compressed_docs.append({
            "content": compressed_content,
            "metadata": doc.metadata
        })
    return compressed_docs