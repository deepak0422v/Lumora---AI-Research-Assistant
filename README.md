<div align="center">

# 🧠 Lumora
### AI-Powered Research Assistant with Retrieval-Augmented Generation (RAG)

<p align="center">
Semantic Search • AI Chat • PDF Intelligence • Research Reports • Source Citations
</p>

<img src="frontend/public/icons.svg" width="120"/>

---

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Search-orange)
![Gemini](https://img.shields.io/badge/Google-Gemini-purple)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 📖 Overview

Lumora is an AI-powered research assistant that allows users to upload PDF documents, build a semantic knowledge base, and interact with their documents through natural language conversations.

Instead of searching documents manually, Lumora retrieves only the most relevant information using Retrieval-Augmented Generation (RAG) and generates grounded responses with source citations.

It combines semantic search, keyword matching, contextual memory, and Google's Gemini models to deliver accurate, explainable, and research-focused answers.

---

# ✨ Features

## 📄 Intelligent PDF Processing

- Upload one or multiple PDF documents
- Automatic document parsing
- Intelligent chunking
- Metadata extraction
- Duplicate detection
- Session-based document isolation

---

## 🔍 Hybrid Retrieval Engine

Lumora retrieves information using multiple retrieval strategies:

- Semantic similarity search (FAISS)
- Keyword overlap scoring
- Context boosting
- Source ranking
- Relevance filtering

Only the most relevant chunks are provided to the language model.

---

## 🤖 AI Research Assistant

Ask natural language questions such as

- Summarize this document
- Explain this topic
- Compare two concepts
- Find specific information
- Generate interview questions
- Extract important insights

Responses are grounded only in uploaded documents.

---

## 📑 Source Citations

Every generated response is traceable.

Features include:

- Expandable source citations
- Page references
- Retrieved context preview
- Transparent answer generation

No hallucinated references.

---

## 📊 Research Report Generation

Generate structured research reports directly from uploaded documents.

Reports include:

- Executive Summary
- Key Findings
- Important Concepts
- Analysis
- Conclusions

Download reports as PDF.

---

## 💬 Interactive Chat

- Real-time responses
- Streaming output
- Persistent chat sessions
- Conversation history
- Modern chat interface

---

## 🧠 Context-Aware Memory

Lumora remembers conversation context during a session to support follow-up questions naturally.

---

## 🎨 Modern User Interface

Built with React and modern UI practices.

Features include:

- Dark futuristic theme
- Animated splash screen
- Responsive layout
- Drag-and-drop upload
- Knowledge panel
- Professional typography
- Smooth animations

---

# 🏗 Architecture

```
                  ┌──────────────────────────────┐
                  │         React Frontend       │
                  └──────────────┬───────────────┘
                                 │
                         REST API Requests
                                 │
                  ┌──────────────▼───────────────┐
                  │        FastAPI Backend       │
                  └──────────────┬───────────────┘
                                 │
          ┌──────────────────────┼─────────────────────┐
          │                      │                     │
          ▼                      ▼                     ▼
    PDF Processing        Session Manager      Report Generator
          │
          ▼
    Intelligent Chunking
          │
          ▼
 Gemini Embeddings
          │
          ▼
      FAISS Vector Store
          │
          ▼
 Hybrid Retrieval Engine
          │
          ▼
 Context Builder
          │
          ▼
 Gemini LLM
          │
          ▼
 Grounded Response + Citations
```

---

# ⚙ Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Markdown
- Lucide Icons

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- LangChain
- Google Gemini
- FAISS
- Pydantic

---

## AI Stack

- Gemini Flash
- Gemini Embeddings
- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Hybrid Retrieval

---

## Storage

- SQLite
- FAISS Vector Database

---

# 📂 Project Structure

```
Lumora
│
├── app
│   ├── api
│   ├── services
│   ├── models
│   ├── core
│   └── utils
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── context
│   │   ├── services
│   │   └── assets
│
├── data
│   ├── raw_docs
│   ├── vector_store
│   └── lumora.db
│
├── tests
│
├── requirements.txt
└── README.md
```

---

# 🔄 Workflow

```
Upload PDF

      ↓

Extract Text

      ↓

Chunk Document

      ↓

Generate Embeddings

      ↓

Store in FAISS

      ↓

User asks Question

      ↓

Retrieve Relevant Chunks

      ↓

Build Context

      ↓

Gemini generates grounded answer

      ↓

Return Answer + Citations
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Lumora.git

cd Lumora
```

---

## Backend

```bash
python -m venv venv

source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

# 📡 API Endpoints

| Endpoint | Description |
|-----------|-------------|
| POST /upload | Upload PDFs |
| POST /ask | Ask research questions |
| POST /stream | Streaming chat |
| GET /documents | List uploaded documents |
| DELETE /documents/{filename} | Delete document |
| POST /report | Generate research report |

---

# 📸 Screenshots

> Add screenshots after deployment.

Suggested images:

- Landing Page
- Chat Interface
- Upload Panel
- Source Citations
- Report Generation
- Knowledge Base

---

# 🔮 Future Improvements

- Multi-user authentication
- Cloud document storage
- OCR for scanned PDFs
- Image understanding
- Table extraction
- Web research integration
- Voice interaction
- Multi-language support
- Citation export
- Knowledge graph visualization

---

# 🎯 Use Cases

- Academic Research
- Resume Analysis
- Legal Document Review
- Technical Documentation
- Business Reports
- Policy Documents
- Research Papers
- Interview Preparation

---

# 👨‍💻 Author

**Parasa Deepak Kumar**

AI & Machine Learning Engineer

GitHub: https://github.com/deepak0422v

LinkedIn: *(Add your LinkedIn profile)*

---

<div align="center">

### ⭐ If you found Lumora useful, consider giving it a star!

Built with ❤️ using FastAPI, React, Gemini, and FAISS.

</div>
