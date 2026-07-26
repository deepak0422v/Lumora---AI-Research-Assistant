from app.services.pdf_reader import extract_text_from_pdf

if __name__ == "__main__":
    text = extract_text_from_pdf("data/raw_docs/Resume.pdf")
    print(text[:300])