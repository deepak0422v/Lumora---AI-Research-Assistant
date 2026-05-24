from pathlib import Path

from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.vector_store import create_vector_store


PDF_PATH = Path("data/raw_docs/Resume Main.pdf")

text = extract_text_from_pdf(str(PDF_PATH))

chunks = chunk_text(text)

vector_store = create_vector_store(
    chunks=chunks,
    source_name=PDF_PATH.name
)

print("Vector store created successfully.")