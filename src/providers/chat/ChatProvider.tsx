"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ChatContextValue } from "./types";
import type { ChatMessage, AgentMode } from "../../../shared/agent-types";
import { matchScript } from "@/data/dummy/chat-scripts";

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Welcome to Tokamak DAO! I can help you understand proposals, voting, and delegation. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AgentMode>("chat");
  const streamingRef = useRef(false);

  const sendMessage = useCallback(
    (content?: string) => {
      const text = content || input;
      if (!text.trim() || streamingRef.current) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      streamingRef.current = true;

      // Simulate SSE streaming with word-by-word delivery
      const response = matchScript(text);
      const words = response.text.split(" ");
      let currentText = "";
      let wordIndex = 0;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex > 0 ? " " : "") + words[wordIndex];
          wordIndex++;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: currentText };
            }
            return updated;
          });
        } else {
          clearInterval(interval);
          setIsLoading(false);
          streamingRef.current = false;
        }
      }, 50);
    },
    [input]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. How can I help you with Tokamak governance?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <ChatContext.Provider
      value={{ messages, input, setInput, isLoading, sendMessage, clearChat, mode, setMode }}
    >
      {children}
    </ChatContext.Provider>
  );
}
