from langchain_core.prompts import ChatPromptTemplate
from app.services.generator import llm_primary, llm_fallback, extract_text_from_content

report_prompt = ChatPromptTemplate.from_template("""
{context}

Create a professional research report.

Structure:

# Title

# Executive Summary

# Key Findings

# Insights

# Future Directions

# Sources Used

Use concise formatting with bullets.
Keep the report professional and readable.

Question:
{question}

Report:
""")

def generate_report(
    context: str,
    question: str
):
    try:
        chain = report_prompt | llm_primary
        response = chain.invoke(
            {
                "context": context,
                "question": question
            }
        )
        return extract_text_from_content(response.content)
    except Exception as e:
        print(f"Primary model for report generation failed, falling back to 8B: {e}")
        chain = report_prompt | llm_fallback
        response = chain.invoke(
            {
                "context": context,
                "question": question
            }
        )
        return extract_text_from_content(response.content)