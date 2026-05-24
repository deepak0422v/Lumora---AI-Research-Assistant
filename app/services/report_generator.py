from langchain_core.prompts import ChatPromptTemplate
from app.services.generator import llm

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
    chain = report_prompt | llm
    response = chain.invoke(
        {
            "context": context,
            "question": question
        }
    )
    return response.content