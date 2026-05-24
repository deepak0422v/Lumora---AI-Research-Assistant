# retriever.py
import re
from pathlib import Path
from app.services.vector_store import load_vector_store


def clean_words(text):
    return set(re.findall(r"\w+", text.lower()))


def keyword_overlap_score(query, content):
    query_words = clean_words(query)
    content_words = clean_words(content)
    return len(query_words.intersection(content_words))


def extract_filenames(query: str) -> list[str]:
    """Extract any PDF filenames mentioned in the query."""
    return re.findall(r'[\w\-]+\.pdf', query.lower())


def clean_query(query: str) -> str:
    """Remove PDF filenames from query so semantic search isn't polluted."""
    cleaned = re.sub(r'[\w\-]+\.pdf', '', query).strip()
    # fallback: if cleaning leaves nothing, use original
    return cleaned if cleaned else query


def retrieve_documents(query: str):
    vector_store = load_vector_store()
    if vector_store is None:
        return []

    filename_matches = extract_filenames(query)
    search_query = clean_query(query)  # ← clean before semantic search

    semantic_results = vector_store.max_marginal_relevance_search(
        query=search_query,
        k=10,
        fetch_k=20
    )

    scored_results = []

    for idx, doc in enumerate(semantic_results):
        semantic_score = len(semantic_results) - idx
        keyword_score = keyword_overlap_score(search_query, doc.page_content)

        source_name = Path(doc.metadata.get("source", "")).name.lower()

        boost = 0
        for file in filename_matches:
            if file == source_name:
                boost += 10

        final_score = (semantic_score * 0.7) + (keyword_score * 0.3) + boost

        scored_results.append((final_score, doc))

    scored_results.sort(key=lambda x: x[0], reverse=True)

    unique_docs = []
    seen_contents = set()

    for score, doc in scored_results:
        if score < 3:
            continue
        if doc.page_content not in seen_contents:
            unique_docs.append(doc)
            seen_contents.add(doc.page_content)

    return unique_docs[:8]