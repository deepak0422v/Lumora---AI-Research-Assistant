from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings

# Primary high-reasoning model (70B)
llm_primary = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.2
)

# Secondary fast fallback model (8B)
llm_fallback = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model_name="llama-3.1-8b-instant",
    temperature=0.2
)

prompt = ChatPromptTemplate.from_template("""
You are Lumora, a production-grade AI research assistant.

Context from Documents:
{context}

User Question: {question}

Response Instructions:
1. Tone & Behavior:
   - For general conversational queries (greetings, casual chat), reply warmly and concisely without forced formatting.
   - For factual or document-based research questions, behave as an analytical research expert.
2. Grounding & Citations:
   - Base your answer strictly on the provided context. Do not make up facts or extrapolate.
   - You MUST cite your statements using inline bracketed numbers matching the source index in the context (e.g., [1], [2]).
   - Combine citations where relevant (e.g., [1][2]).
   - If the documents do not contain the answer, say so clearly. You may follow up with a general knowledge answer, but explicitly label it as general knowledge.
3. Structure & Formatting:
   - Use short, readable paragraphs (2-4 lines).
   - Use bold (**key terms**) for emphasis, section headers, and key highlights.
   - Use clean bullet points (•) for lists, key findings, or structured parameters.
   - When requested or appropriate, organize comparisons or data in markdown tables.

Answer:
""")


def generate_answer(context: str, question: str) -> str:
    try:
        chain = prompt | llm_primary
        response = chain.invoke({"context": context, "question": question})
        return response.content
    except Exception as e:
        print(f"Primary model failed, falling back to 8B: {e}")
        chain = prompt | llm_fallback
        response = chain.invoke({"context": context, "question": question})
        return response.content


def stream_answer(context: str, question: str):
    try:
        chain = prompt | llm_primary
        for chunk in chain.stream({"context": context, "question": question}):
            if chunk.content:
                yield chunk.content
    except Exception as e:
        print(f"Primary streaming model failed, falling back to 8B: {e}")
        chain = prompt | llm_fallback
        for chunk in chain.stream({"context": context, "question": question}):
            if chunk.content:
                yield chunk.content


# Alias for backward compatibility / report generator
llm = llm_primary
