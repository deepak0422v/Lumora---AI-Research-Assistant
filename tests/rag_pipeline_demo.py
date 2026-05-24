from app.services.retriever import retrieve_documents
from app.services.generator import generate_answer


question = "What are Deepak's technical skills?"


results = retrieve_documents(question)

context = "\n\n".join(
    [doc.page_content for doc in results]
)


answer = generate_answer(context, question)

print("\nANSWER:\n")

print(answer)