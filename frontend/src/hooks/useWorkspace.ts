import { useState, useEffect, useRef, useCallback } from "react";
import { api, type Session, type ApiMessage, type DocumentItem, type SourceItem } from "../services/api";

const STORAGE_KEYS = {
  ACTIVE_SESSION: "lumora_active_session_id",
  SESSIONS: "lumora_sessions_cache",
  SIDEBAR_OPEN: "lumora_sidebar_open",
  DOCUMENTS_OPEN: "lumora_documents_open",
};

export function useWorkspace() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || "";
  });

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return cached !== null ? JSON.parse(cached) : true;
  });

  const [documentsOpen, setDocumentsOpen] = useState<boolean>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.DOCUMENTS_OPEN);
    return cached !== null ? JSON.parse(cached) : true;
  });

  const [isResearching, setIsResearching] = useState<boolean>(false);
  const chatInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS_OPEN, JSON.stringify(documentsOpen));
  }, [documentsOpen]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Initial Load: Sync sessions from backend
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const fetchedSessions = await api.getSessions();
        if (!isMounted) return;

        setSessions(fetchedSessions);

        const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
        const validActive = fetchedSessions.find((s) => s.id === savedId);

        if (validActive) {
          setActiveSessionId(validActive.id);
        } else if (fetchedSessions.length > 0) {
          setActiveSessionId(fetchedSessions[0].id);
        } else {
          const newSess = await api.createSession("New exploration");
          if (!isMounted) return;
          setSessions([newSess]);
          setActiveSessionId(newSess.id);
        }
      } catch (err) {
        console.error("Error loading initial sessions:", err);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch documents whenever activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) {
      setDocuments([]);
      return;
    }

    let isMounted = true;

    async function loadDocuments() {
      try {
        const docs = await api.getDocuments(activeSessionId);
        if (isMounted) {
          setDocuments(docs);
        }
      } catch (err) {
        console.error("Error loading session documents:", err);
        if (isMounted) setDocuments([]);
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [activeSessionId]);

  // Fetch messages whenever activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      try {
        const msgs = await api.getSessionMessages(activeSessionId);
        if (isMounted) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Error loading session messages:", err);
        if (isMounted) setMessages([]);
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [activeSessionId]);

  // Handle New Exploration (Session Creation)
  const handleNewSession = useCallback(async () => {
    try {
      const newSession = await api.createSession("New exploration");
      setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
      setActiveSessionId(newSession.id);
      setMessages([]);

      // Auto-focus chat input
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 50);
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  }, []);

  // Handle Session Selection
  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  }, []);

  // Handle Session Deletion
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await api.deleteSession(sessionId);
        setSessions((prev) => {
          const updated = prev.filter((s) => s.id !== sessionId);
          if (activeSessionId === sessionId) {
            if (updated.length > 0) {
              setActiveSessionId(updated[0].id);
            } else {
              handleNewSession();
            }
          }
          return updated;
        });
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    },
    [activeSessionId, handleNewSession]
  );

  // Handle Retry Message
  const handleRetryMessage = useCallback(
    async (assistantMsgId: string) => {
      let currentSessionId = activeSessionId;

      // Find assistant message and preceding user message
      setMessages((prevMessages) => {
        const assistantIdx = prevMessages.findIndex((m) => m.id === assistantMsgId);
        if (assistantIdx === -1) return prevMessages;

        let userMsg: ApiMessage | null = null;
        for (let i = assistantIdx - 1; i >= 0; i--) {
          if (prevMessages[i].role === "user") {
            userMsg = prevMessages[i];
            break;
          }
        }

        if (!userMsg) return prevMessages;

        const promptText = userMsg.content;

        // Reset assistant message state
        const updated = prevMessages.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "",
                sources: [],
                status: "thinking" as const,
                thinkingText: "Searching knowledge base...",
                error: false,
              }
            : m
        );

        setIsResearching(true);

        // Execute streaming for retry
        api.streamQuestion(
          currentSessionId,
          promptText,
          (chunk) => {
            setIsResearching(false);
            setMessages((msgs) =>
              msgs.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: m.content + chunk,
                      status: "streaming",
                      thinkingText: "",
                      error: false,
                    }
                  : m
              )
            );
          },
          (sources: SourceItem[]) => {
            setMessages((msgs) =>
              msgs.map((m) => (m.id === assistantMsgId ? { ...m, sources } : m))
            );
          },
          (_fullText) => {
            setIsResearching(false);
            setMessages((msgs) =>
              msgs.map((m) =>
                m.id === assistantMsgId ? { ...m, status: "complete", error: false } : m
              )
            );
          },
          async (_err) => {
            try {
              const res = await api.askQuestion(currentSessionId, promptText);
              setIsResearching(false);
              setMessages((msgs) =>
                msgs.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: res.answer,
                        sources: res.sources,
                        status: "complete",
                        error: false,
                      }
                    : m
                )
              );
            } catch (askErr) {
              console.error("Retry failed:", askErr);
              setIsResearching(false);
              setMessages((msgs) =>
                msgs.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        status: "error",
                        error: true,
                      }
                    : m
                )
              );
            }
          }
        );

        return updated;
      });
    },
    [activeSessionId]
  );

  // Handle Edit Prompt (Loads prompt into input ref)
  const handleEditPrompt = useCallback((promptText: string) => {
    if (chatInputRef.current) {
      chatInputRef.current.value = promptText;
      chatInputRef.current.focus();
      // Trigger input event to update controlled components if needed
      const event = new Event("input", { bubbles: true });
      chatInputRef.current.dispatchEvent(event);
    }
  }, []);

  // Handle Sending Message & RAG Chat Streaming
  const handleSendMessage = useCallback(
    async (userMessage: string, files?: File[]) => {
      const hasMessage = !!userMessage.trim();
      const hasFiles = !!(files && files.length > 0);
      if (!hasMessage && !hasFiles) return;

      let currentSessionId = activeSessionId;
      const derivedTitle = hasMessage
        ? (userMessage.length > 30 ? userMessage.slice(0, 30) + "..." : userMessage)
        : (hasFiles ? files![0].name : "New exploration");

      // Create a session if none exists
      if (!currentSessionId) {
        try {
          const newSess = await api.createSession(derivedTitle);
          currentSessionId = newSess.id;
          setSessions((prev) => [newSess, ...prev]);
          setActiveSessionId(currentSessionId);
        } catch (err) {
          console.error("Failed to create session:", err);
          return;
        }
      } else {
        // Update title if session is "New exploration"
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId && (s.title === "New exploration" || !s.title)) {
              api.updateSession(currentSessionId, derivedTitle);
              return { ...s, title: derivedTitle };
            }
            return s;
          })
        );
      }

      // Handle file uploads if present
      if (hasFiles) {
        for (const file of files!) {
          if (!file.name.toLowerCase().endsWith(".pdf")) {
            console.warn(`File ${file.name} is not a PDF, skipping.`);
            continue;
          }
          try {
            const uploadedDoc = await api.uploadDocument(file, currentSessionId);
            setDocuments((prev) => [...prev.filter((d) => d.filename !== uploadedDoc.filename), uploadedDoc]);
          } catch (err) {
            console.error(`Document upload failed for ${file.name}:`, err);
          }
        }
      }

      if (!hasMessage) return;

      const userMsgId = `user_${Date.now()}`;
      const assistantMsgId = `assistant_${Date.now()}`;

      const newUserMsg: ApiMessage = {
        id: userMsgId,
        session_id: currentSessionId,
        role: "user",
        content: userMessage,
      };

      const initialAssistantMsg: ApiMessage = {
        id: assistantMsgId,
        session_id: currentSessionId,
        role: "assistant",
        content: "",
        sources: [],
        status: "thinking",
        thinkingText: "Searching knowledge base...",
        error: false,
      };

      setMessages((prev) => [...prev, newUserMsg, initialAssistantMsg]);
      setIsResearching(true);

      // Simulate subtle thinking phase transition before streaming tokens arrive
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId && m.status === "thinking"
              ? { ...m, thinkingText: "Retrieving relevant context..." }
              : m
          )
        );
      }, 600);

      // Attempt Streaming response
      await api.streamQuestion(
        currentSessionId,
        userMessage,
        (chunk) => {
          setIsResearching(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: m.content + chunk,
                    status: "streaming",
                    thinkingText: "",
                    error: false,
                  }
                : m
            )
          );
        },
        (sources: SourceItem[]) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, sources } : m))
          );
        },
        (_fullText) => {
          setIsResearching(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, status: "complete", error: false }
                : m
            )
          );
        },
        // Fallback to standard ask API if stream fails
        async (_err) => {
          try {
            const res = await api.askQuestion(currentSessionId, userMessage);
            setIsResearching(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: res.answer,
                      sources: res.sources,
                      status: "complete",
                      error: false,
                    }
                  : m
              )
            );
          } catch (askErr) {
            console.error("Ask question error:", askErr);
            setIsResearching(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      status: "error",
                      error: true,
                    }
                  : m
              )
            );
          }
        }
      );
    },
    [activeSessionId]
  );

  // Handle Document Upload
  const handleUploadFile = useCallback(
    async (file: File) => {
      try {
        const uploadedDoc = await api.uploadDocument(file, activeSessionId);
        setDocuments((prev) => [...prev.filter((d) => d.filename !== uploadedDoc.filename), uploadedDoc]);
      } catch (err: any) {
        console.error("Document upload failed:", err);
        throw err;
      }
    },
    [activeSessionId]
  );

  // Handle Document Deletion
  const handleDeleteFile = useCallback(async (filename: string) => {
    try {
      await api.deleteDocument(filename, activeSessionId);
      setDocuments((prev) => prev.filter((d) => d.filename !== filename));
    } catch (err) {
      console.error("Document delete failed:", err);
    }
  }, [activeSessionId]);

  const handleRenameSession = useCallback(async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await api.updateSession(sessionId, newTitle);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      );
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
  }, []);

  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // Handle Generating and Downloading Research Report
  const handleDownloadReport = useCallback(async () => {
    if (!activeSessionId) return;

    const userMsgs = messages.filter((m) => m.role === "user");
    const lastQuestion = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : "Summarize session documents";

    setIsGeneratingReport(true);
    try {
      const blob = await api.downloadReport(activeSessionId, lastQuestion);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lumora_Report_${activeSessionId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate and download report:", err);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [activeSessionId, messages]);

  return {
    sessions,
    activeSessionId,
    messages,
    documents,
    sidebarOpen,
    documentsOpen,
    isResearching,
    chatInputRef,
    isGeneratingReport,
    setSidebarOpen,
    setDocumentsOpen,
    handleNewSession,
    handleSelectSession,
    handleDeleteSession,
    handleSendMessage,
    handleRetryMessage,
    handleEditPrompt,
    handleUploadFile,
    handleDeleteFile,
    handleRenameSession,
    handleDownloadReport,
  };
}
