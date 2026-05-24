from langchain_text_splitters import (RecursiveCharacterTextSplitter)

def chunk_text(pages):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=150,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " "
        ]
    )
    chunked_docs = []
    for page in pages:
        chunks = splitter.split_text(page["text"])
        for chunk in chunks:
            chunked_docs.append(
                {
                    "content": chunk,
                    "page": page["page"]
                }
            )
    return chunked_docs