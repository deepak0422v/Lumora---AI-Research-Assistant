from pathlib import Path

from fastapi import APIRouter, UploadFile, File

from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.vector_store import add_documents_to_vector_store


router = APIRouter()

UPLOAD_DIR = "data/raw_docs"


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = Path(UPLOAD_DIR) / file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(str(file_path))

    chunks = chunk_text(text)

    add_documents_to_vector_store(
        chunks=chunks,
        source_name=file.filename
    )

    return {
        "message": f"{file.filename} uploaded and indexed successfully."
    }