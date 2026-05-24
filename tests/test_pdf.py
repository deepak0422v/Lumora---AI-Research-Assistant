from app.services.pdf_reader import extract_text_from_pdf

text = extract_text_from_pdf("data/raw_docs/Resume Main.pdf")

print(text[:300])