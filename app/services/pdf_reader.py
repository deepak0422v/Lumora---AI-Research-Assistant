from pypdf import PdfReader
import re

def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"•", "\n•", text)
    text = re.sub(r"(?<!\n)(Projects)", r"\n\1", text)
    text = re.sub(r"(?<!\n)(Technical Skills)", r"\n\1", text)
    text = re.sub(r"(?<!\n)(Certifications)", r"\n\1", text)
    return text.strip()

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        if not reader.pages or len(reader.pages) == 0:
            raise ValueError("PDF has no pages.")
        pages = []
        for page_num, page in enumerate(reader.pages):
            extracted = page.extract_text()
            if extracted:
                pages.append(
                    {
                        "page": page_num + 1,
                        "text": clean_text(extracted)
                    }
                )
        return pages
    except Exception as e:
        raise ValueError(f"Invalid or corrupt PDF file: {str(e)}")