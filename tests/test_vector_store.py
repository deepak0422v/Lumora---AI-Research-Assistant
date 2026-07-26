from pathlib import Path

from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.vector_store import add_documents_to_vector_store

if __name__ == "__main__":
    PDF_PATH = Path("data/raw_docs/Resume.pdf")
    text = extract_text_from_pdf(str(PDF_PATH))
    chunks = chunk_text(text)
    vector_store = add_documents_to_vector_store(
        chunks=chunks,
        source_name=PDF_PATH.name
    )
    print("Vector store created successfully.")