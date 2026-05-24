from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunker import chunk_text

text = extract_text_from_pdf("data/raw_docs/Resume Main.pdf")

chunks = chunk_text(text)

print(f"Total chunks: {len(chunks)}")

print("\nFIRST CHUNK:\n")
print(chunks[0])