import os
import shutil
import unittest
from unittest.mock import patch
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.services.db import init_db

class TestE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database is initialized
        init_db()
        cls.client = TestClient(app)

    def test_01_sessions_lifecycle(self):
        # 1. Create a session
        res = self.client.post("/sessions", json={"title": "Test exploration"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("id", data)
        self.assertEqual(data["title"], "Test exploration")
        session_id = data["id"]

        # 2. Rename the session
        res = self.client.put(f"/sessions/{session_id}", json={"title": "Test exploration renamed"})
        self.assertEqual(res.status_code, 200)
        
        # 3. Retrieve sessions list and verify rename
        res = self.client.get("/sessions")
        self.assertEqual(res.status_code, 200)
        sessions = res.json()
        titles = [s["title"] for s in sessions]
        self.assertIn("Test exploration renamed", titles)

        # 4. Get session messages (should be empty initially)
        res = self.client.get(f"/sessions/{session_id}/messages")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 0)

        # 5. Delete session
        res = self.client.delete(f"/sessions/{session_id}")
        self.assertEqual(res.status_code, 200)

        # 6. Fetch details (should return 404)
        res = self.client.get(f"/sessions/{session_id}")
        self.assertEqual(res.status_code, 404)

    def test_02_secure_uploads_and_isolation(self):
        # Create two isolated sessions
        sess_a = self.client.post("/sessions", json={"title": "Session A"}).json()["id"]
        sess_b = self.client.post("/sessions", json={"title": "Session B"}).json()["id"]

        # 1. Attempt upload of unsupported file type (.txt)
        res = self.client.post(
            "/upload",
            data={"session_id": sess_a},
            files={"file": ("test.txt", b"some plain text content", "text/plain")}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Only PDF files are supported", res.json()["detail"])

        # 2. Attempt upload of an empty PDF file (0 bytes)
        res = self.client.post(
            "/upload",
            data={"session_id": sess_a},
            files={"file": ("empty.pdf", b"", "application/pdf")}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("empty", res.json()["detail"].lower())

        # 3. Prepare and upload a valid PDF
        # We define raw mini-PDF bytes containing searchable keywords
        pdf_bytes = (
            b"%PDF-1.4\n"
            b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
            b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
            b"3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595.275 841.889] /Contents 4 0 R >> endobj\n"
            b"4 0 obj << /Length 60 >> stream\n"
            b"BT /F1 12 Tf 100 700 Td (PARASA DEEPAK KUMAR possesses technical skills in React Node) Tj ET\n"
            b"endstream endobj\n"
            b"xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000275 00000 n\n"
            b"trailer << /Size 5 /Root 1 0 R >>\n"
            b"startxref\n381\n%%EOF"
        )

        res = self.client.post(
            "/upload",
            data={"session_id": sess_a},
            files={"file": ("Resume.pdf", pdf_bytes, "application/pdf")}
        )
        self.assertEqual(res.status_code, 200)

        # 4. Verify duplicate detection within Session A
        res_dup = self.client.post(
            "/upload",
            data={"session_id": sess_a},
            files={"file": ("Resume.pdf", pdf_bytes, "application/pdf")}
        )
        self.assertEqual(res_dup.status_code, 400)
        self.assertIn("already exists in this session", res_dup.json()["detail"])

        # 5. Verify document list isolation (Session A has it, Session B does not)
        res_docs_a = self.client.get(f"/documents?session_id={sess_a}").json()
        self.assertEqual(len(res_docs_a), 1)
        self.assertEqual(res_docs_a[0]["filename"], "Resume.pdf")

        res_docs_b = self.client.get(f"/documents?session_id={sess_b}").json()
        self.assertEqual(len(res_docs_b), 0)

        # 6. Verify RAG Ask isolation (Session B query retrieves no context from Session A)
        with patch("app.api.ask.generate_answer", return_value="Deepak has technical skills in React and Node [1]."):
            # Ask in Session B
            res_ask_b = self.client.post(
                "/ask",
                json={"session_id": sess_b, "question": "What are Deepak's technical skills?"}
            ).json()
            self.assertEqual(len(res_ask_b["sources"]), 0)

            # Ask in Session A
            res_ask_a = self.client.post(
                "/ask",
                json={"session_id": sess_a, "question": "What are Deepak's technical skills?"}
            ).json()
            self.assertGreater(len(res_ask_a["sources"]), 0)
            self.assertEqual(res_ask_a["sources"][0]["source"], "Resume.pdf")

        # 7. Verify SSE Streaming response
        with patch("app.api.stream.stream_answer", return_value=["Deepak ", "React"]):
            res_stream = self.client.post(
                "/stream",
                json={"session_id": sess_a, "question": "What are Deepak's technical skills?"}
            )
            self.assertEqual(res_stream.status_code, 200)
            self.assertIn("sources", res_stream.text)
            self.assertIn("Resume.pdf", res_stream.text)
            self.assertIn("React", res_stream.text)

        # 8. Verify Document deletion (Session A)
        res_del = self.client.delete(f"/documents/Resume.pdf?session_id={sess_a}")
        self.assertEqual(res_del.status_code, 200)
        
        res_docs_a_post = self.client.get(f"/documents?session_id={sess_a}").json()
        self.assertEqual(len(res_docs_a_post), 0)

        # 9. Clean up sessions
        self.client.delete(f"/sessions/{sess_a}")
        self.client.delete(f"/sessions/{sess_b}")

if __name__ == "__main__":
    unittest.main()
