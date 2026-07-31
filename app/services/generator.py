from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings

# Primary high-reasoning model
llm_primary = ChatGoogleGenerativeAI(
    google_api_key=settings.GEMINI_API_KEY,
    model="gemini-flash-latest",
    temperature=0.2
)

# Secondary fast fallback model
llm_fallback = ChatGoogleGenerativeAI(
    google_api_key=settings.GEMINI_API_KEY,
    model="gemini-3.1-flash-lite",
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


def extract_text_from_content(content) -> str:
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, str):
                texts.append(part)
            elif isinstance(part, dict) and "text" in part:
                texts.append(part["text"])
            elif hasattr(part, "get") and part.get("text"):
                texts.append(part.get("text"))
        return "".join(texts)
    return str(content)


def generate_answer(context: str, question: str) -> str:
    try:
        chain = prompt | llm_primary
        response = chain.invoke({"context": context, "question": question})
        return extract_text_from_content(response.content)
    except Exception as e:
        print(f"Primary model failed, falling back to 8B: {e}")
        chain = prompt | llm_fallback
        response = chain.invoke({"context": context, "question": question})
        return extract_text_from_content(response.content)


def stream_answer(context: str, question: str):
    try:
        chain = prompt | llm_primary
        for chunk in chain.stream({"context": context, "question": question}):
            if chunk.content:
                text = extract_text_from_content(chunk.content)
                if text:
                    yield text
    except Exception as e:
        print(f"Primary streaming model failed, falling back to 8B: {e}")
        chain = prompt | llm_fallback
        for chunk in chain.stream({"context": context, "question": question}):
            if chunk.content:
                text = extract_text_from_content(chunk.content)
                if text:
                    yield text


# Alias for backward compatibility / report generator
llm = llm_primary