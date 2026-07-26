import type { SourceItem } from "../services/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
  status?: "thinking" | "searching" | "retrieving" | "generating" | "streaming" | "complete" | "error";
  thinkingText?: string;
  error?: boolean | string;
}