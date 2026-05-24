# Lumora – AI Research Assistant

Lumora is an AI-powered document intelligence platform that enables users to upload PDFs, interact with documents through natural language, and generate structured research reports.

## Features

- Multi-document RAG
- Semantic search using FAISS
- Conversation memory
- Source-grounded responses
- PDF evidence tracking
- Source preview with page references
- Downloadable research reports
- Real-time response streaming
- Modern responsive UI

## Tech Stack

Frontend:
- React
- TypeScript
- TailwindCSS

Backend:
- FastAPI
- LangChain
- FAISS
- HuggingFace Embeddings
- Groq API

## Installation

Backend:

pip install -r requirements.txt

uvicorn app.main:app --reload

Frontend:

npm install

npm run dev

## Environment Variables

Create .env:

GROQ_API_KEY=your_key
BACKEND_URL=http://127.0.0.1:8000

## Future Scope

- Embedded PDF evidence highlighting
- Advanced research workflows