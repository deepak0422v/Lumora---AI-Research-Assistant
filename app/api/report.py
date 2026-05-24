from fastapi import APIRouter
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import styles

from app.models.query import QueryRequest
from app.services.retriever import retrieve_documents
from app.services.context_builder import build_context
from app.services.memory import get_conversation_history
from app.services.report_generator import generate_report

router = APIRouter()

@router.post("/generate-report")
def create_report(request: QueryRequest):
    history = get_conversation_history(request.session_id)
    results = retrieve_documents(request.question)
    retrieved_context = "\n\n".join(
        f"Source:\n{doc.metadata.get('source')}\n\nContent:\n{doc.page_content}"
        for doc in results
    )
    context = build_context(history, retrieved_context)
    report = generate_report(
        context=context,
        question=request.question
    )
    pdf_path = "report.pdf"
    doc = SimpleDocTemplate(pdf_path)
    stylesheets = styles.getSampleStyleSheet()
    story = []
    for line in report.split("\n"):
        if line.strip():
            story.append(
                Paragraph(line, stylesheets["BodyText"])
            )
            story.append(Spacer(1, 6))
    doc.build(story)
    return FileResponse(
        pdf_path,
        filename="Lumora_Report.pdf",
        media_type="application/pdf"
    )