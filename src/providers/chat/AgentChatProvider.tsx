"use client";

import React from "react";
import { ChatContext } from "./context";
import { useAgentChat } from "@/hooks/useAgentChat";

/**
 * Chat provider backed by the real dao-agent SSE server.
 * Same ChatContextValue interface as the dummy ChatProvider.
 */
export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const value = useAgentChat();

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}
