# Lumora – AI Research Assistant

Lumora is an AI-powered document intelligence platform that allows users to upload PDFs, ask natural language questions, retrieve source-grounded answers, and generate structured research reports.

---

## Features

- Multi-document Retrieval-Augmented Generation (RAG)
- Semantic document search using FAISS
- Source-grounded responses with citations
- Source preview with page references
- PDF evidence tracking
- Conversation memory
- Real-time streaming responses
- Downloadable research reports
- Modern responsive interface

---

## Tech Stack

### Frontend
- React
- TypeScript
- TailwindCSS

### Backend
- FastAPI
- LangChain
- FAISS Vector Store
- HuggingFace Embeddings
- Groq LLM API

---

## Project Architecture

User Query
↓
Retriever (FAISS)
↓
Context Builder
↓
Groq LLM
↓
Response Generation
↓
Citation + Source Preview

---

## Installation

### Backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend2
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
BACKEND_URL=http://127.0.0.1:8000
```

---

## Screenshots

(Add Lumora screenshots here after deployment)

---

## Future Improvements

- Embedded PDF evidence highlighting
- Research workflow automation
- Enhanced document analytics

---

## Author

Parasa Deepak Kumar

B.Tech CSE (AIML) | Mohan Babu University

GitHub: https://github.com/deepak0422v
<<<<<<< HEAD
LinkedIn: https://linkedin.com/in/deepak0422
=======
LinkedIn: https://linkedin.com/in/deepak0422
>>>>>>> 6464868 (Add Railway deployment config)
