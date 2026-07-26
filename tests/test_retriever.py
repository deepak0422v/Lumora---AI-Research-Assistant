from app.services.retriever import retrieve_documents

if __name__ == "__main__":
    query = "What are Deepak's technical skills?"
    results = retrieve_documents(query)
    for i, doc in enumerate(results, start=1):
        print(f"\nRESULT {i}\n")
        print(doc.page_content)