/**
 * Agent SSE Protocol Types
 * Matches dao-agent server SSE events
 */

export type AgentMode = "chat" | "analyze_proposal";

export type ChatSSEEvent =
  | { type: "text_delta"; content: string }
  | { type: "tool_use"; tool_id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_id: string; name: string; result: string; is_error: boolean }
  | { type: "thinking" }
  | { type: "done" }
  | { type: "error"; message: string };

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  parts?: MessagePart[];
  timestamp: Date;
}

export interface MessagePart {
  type: "text" | "tool_call" | "thinking";
  content?: string;
  toolCall?: ToolCall;
}

export interface ToolCall {
  id?: string;
  name: string;
  result?: string;
  isError?: boolean;
  isRunning: boolean;
}

export interface AgentChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  mode?: AgentMode;
  model?: string;
}
