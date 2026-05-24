// API client for Lumora backend.
// Backend endpoints (DO NOT MODIFY): POST /stream, POST /ask
// Set VITE_API_BASE_URL to point to the backend host (defaults to same origin).

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export interface Source {
  source: string;
  chunk_id: number;
  page?: number;
  snippet: string;
  pdf_url?: string;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
}

const url = (path: string) => `${API_BASE}${path}`;

export async function ask(question: string, sessionId: string): Promise<AskResponse> {
  const res = await fetch(url("/ask"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`ask failed: ${res.status}`);
  return res.json();
}

/**
 * Streams the response token-by-token. Invokes onToken for each chunk
 * received from the server. Returns the final accumulated text.
 */
export async function streamAsk(
  question: string,
  sessionId: string,
  onToken: (chunk: string, accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(url("/stream"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId }),
    signal,
  });

  if (!res.ok || !res.body) throw new Error(`stream failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;
    accumulated += chunk;
    onToken(chunk, accumulated);
  }
  return accumulated;
}

// Optional document upload — backend endpoint assumed at POST /upload.
// If the backend doesn't expose this yet, the UI surfaces the error.
export async function uploadDocument(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ filename: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ filename: data.filename ?? file.name });
        } catch {
          resolve({ filename: file.name });
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.open("POST", url("/upload"));
    xhr.send(form);
  });
}

export async function generateReport(
  question: string,
  sessionId: string
) {
  const response = await fetch(
    url("/generate-report"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        session_id: sessionId,
      }),
    }
  );
  const blob = await response.blob();
  const urlObj = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = urlObj;
  link.download = "Lumora_Report.pdf";
  link.click();
  window.URL.revokeObjectURL(urlObj);
}
