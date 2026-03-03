import type { ChatMessage, AgentMode } from "../../../shared/agent-types";

export interface ChatContextValue {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  sendMessage: (content?: string) => void;
  clearChat: () => void;
  mode: AgentMode;
  setMode: (mode: AgentMode) => void;
}
