from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings


llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model_name="llama-3.1-8b-instant",
    temperature=0
)

prompt = ChatPromptTemplate.from_template("""
{context}

Question: {question}

Answer formatting rules:

- Use bullet points (•) for lists, features, skills, or multiple items
- Use bold (**text**) for important terms and headings
- Use short paragraphs (2-3 lines max)
- Avoid large walls of text
- For comparisons, use a side-by-side structure
- For insights, start with a one-line summary followed by bullets
- Keep responses concise and professional
- Do not repeat the same point twice

Answer:
""")


def generate_answer(context: str, question: str) -> str:
    chain = prompt | llm
    response = chain.invoke({"context": context, "question": question})
    return response.content


def stream_answer(context: str, question: str):
    chain = prompt | llm
    for chunk in chain.stream({"context": context, "question": question}):
        if chunk.content:
            yield chunk.content