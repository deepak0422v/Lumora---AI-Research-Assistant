export interface Session {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface SourceItem {
  id?: string;
  source?: string;
  title?: string;
  page?: number;
  snippet?: string;
  pdf_url?: string;
}

export interface ApiMessage {
  id: string;
  session_id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
  created_at?: string;
  status?: "thinking" | "searching" | "retrieving" | "generating" | "streaming" | "complete" | "error";
  thinkingText?: string;
  error?: boolean | string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_size?: string;
  file_path?: string;
  uploaded_at?: string;
  session_id?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error (${res.status}): ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`Fetch error at ${endpoint}:`, error);
    throw error;
  }
}

function formatMessageSources(sources?: SourceItem[]): SourceItem[] {
  if (!sources) return [];
  return sources.map((src) => {
    if (src.pdf_url && src.pdf_url.startsWith("/")) {
      return {
        ...src,
        pdf_url: `${API_BASE_URL}${src.pdf_url}`,
      };
    }
    return src;
  });
}

export const api = {
  // Session API
  async getSessions(): Promise<Session[]> {
    try {
      return await request<Session[]>("/sessions");
    } catch {
      return [];
    }
  },

  async createSession(title = "New exploration", id?: string): Promise<Session> {
    try {
      return await request<Session>("/sessions", {
        method: "POST",
        body: JSON.stringify({ title, id }),
      });
    } catch {
      const fallbackId = id || `session_${Date.now()}`;
      return { id: fallbackId, title };
    }
  },

  async getSessionMessages(sessionId: string): Promise<ApiMessage[]> {
    try {
      const messages = await request<ApiMessage[]>(`/sessions/${sessionId}/messages`);
      return messages.map((m) => ({
        ...m,
        sources: formatMessageSources(m.sources),
      }));
    } catch {
      return [];
    }
  },

  async updateSession(sessionId: string, title: string): Promise<{ id: string; title: string }> {
    try {
      return await request(`/sessions/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      });
    } catch {
      return { id: sessionId, title };
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await request(`/sessions/${sessionId}`, { method: "DELETE" });
    } catch {
      // Ignore fallback
    }
  },

  // Documents API
  async getDocuments(sessionId?: string): Promise<DocumentItem[]> {
    try {
      const query = sessionId ? `?session_id=${sessionId}` : "";
      return await request<DocumentItem[]>(`/documents${query}`);
    } catch {
      return [];
    }
  },

  async uploadDocument(file: File, sessionId?: string): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to upload document");
    }

    return await res.json();
  },

  async deleteDocument(filename: string, sessionId?: string): Promise<void> {
    try {
      const query = sessionId ? `?session_id=${sessionId}` : "";
      await request(`/documents/${encodeURIComponent(filename)}${query}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete document from backend:", e);
    }
  },

  // Question & RAG Chat API
  async askQuestion(
    sessionId: string,
    question: string
  ): Promise<{ question: string; answer: string; sources: SourceItem[] }> {
    const res = await request<{ question: string; answer: string; sources: SourceItem[] }>("/ask", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    return {
      ...res,
      sources: formatMessageSources(res.sources),
    };
  },

  // Streaming Chat Response
  async streamQuestion(
    sessionId: string,
    question: string,
    onChunk: (chunk: string) => void,
    onSources: (sources: SourceItem[]) => void,
    onComplete: (fullText: string) => void,
    onError: (err: any) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, question }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming endpoint unavailable, falling back to standard ask");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              onComplete(fullText);
              return;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.sources) {
                onSources(formatMessageSources(data.sources));
              }
              if (data.content) {
                fullText += data.content;
                onChunk(data.content);
              }
            } catch {
              // Raw text chunk fallback
              if (dataStr) {
                fullText += dataStr;
                onChunk(dataStr);
              }
            }
          }
        }
      }

      onComplete(fullText);
    } catch (err) {
      onError(err);
    }
  },

  // Report API
  async downloadReport(sessionId: string, question: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/generate-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, question }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to generate report");
    }

    return await res.blob();
  },
};
