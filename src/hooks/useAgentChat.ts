"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ChatMessage,
  AgentMode,
  ChatSSEEvent,
  MessagePart,
} from "../../shared/agent-types";
import type { ChatContextValue } from "@/providers/chat/types";
import { streamChat } from "@/lib/agent-client";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Welcome to Tokamak DAO! I'm connected to the governance agent. Ask me anything about proposals, voting, or delegation.",
  timestamp: new Date(),
};

/**
 * React hook that implements ChatContextValue using real SSE streaming
 * from the dao-agent server.
 */
export function useAgentChat(): ChatContextValue {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AgentMode>("chat");
  const abortRef = useRef<AbortController | null>(null);

  // Abort any active stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    (content?: string) => {
      const text = content || input;
      if (!text.trim()) return;

      // Abort previous stream if still running
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatMessage = {
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      // Add user message + empty assistant placeholder
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: "", parts: [], timestamp: new Date() },
      ]);
      setInput("");
      setIsLoading(true);

      // Build message history for the agent (content-only, no parts/timestamp)
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Start streaming in background
      (async () => {
        try {
          const stream = streamChat(
            { messages: history, mode },
            controller.signal
          );

          for await (const event of stream) {
            if (controller.signal.aborted) break;
            processEvent(event);
          }
        } catch (err) {
          if (controller.signal.aborted) return;
          // Show friendly error — don't throw
          const errorMsg =
            err instanceof Error ? err.message : "Connection failed";
          updateLastAssistant((msg) => ({
            content:
              msg.content ||
              `Sorry, I couldn't connect to the agent server. (${errorMsg})`,
          }));
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      })();
    },
    [input, messages, mode]
  );

  /** Update the last assistant message in-place */
  function updateLastAssistant(
    updater: (msg: ChatMessage) => Partial<ChatMessage>
  ) {
    setMessages((prev) => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === "assistant") {
          const msg = updated[i];
          updated[i] = { ...msg, ...updater(msg) };
          break;
        }
      }
      return updated;
    });
  }

  /** Process a single SSE event */
  function processEvent(event: ChatSSEEvent) {
    switch (event.type) {
      case "text_delta":
        updateLastAssistant((msg) => {
          const parts = [...(msg.parts || [])];
          const lastPart = parts[parts.length - 1];
          // Extend existing text part or create new one
          if (lastPart?.type === "text") {
            parts[parts.length - 1] = {
              ...lastPart,
              content: (lastPart.content || "") + event.content,
            };
          } else {
            parts.push({ type: "text", content: event.content });
          }
          return {
            content: (msg.content || "") + event.content,
            parts,
          };
        });
        break;

      case "tool_use":
        updateLastAssistant((msg) => {
          const parts: MessagePart[] = [
            ...(msg.parts || []),
            {
              type: "tool_call",
              toolCall: {
                id: event.tool_id,
                name: event.name,
                isRunning: true,
              },
            },
          ];
          return { parts };
        });
        break;

      case "tool_result":
        updateLastAssistant((msg) => {
          const parts = (msg.parts || []).map((p) => {
            if (
              p.type === "tool_call" &&
              p.toolCall?.id === event.tool_id
            ) {
              return {
                ...p,
                toolCall: {
                  ...p.toolCall,
                  isRunning: false,
                  result: event.result,
                  isError: event.is_error,
                },
              };
            }
            return p;
          });
          return { parts };
        });
        break;

      case "thinking":
        updateLastAssistant((msg) => {
          const parts: MessagePart[] = [
            ...(msg.parts || []),
            { type: "thinking" },
          ];
          return { parts };
        });
        break;

      case "done":
        updateLastAssistant((msg) => {
          // Remove trailing thinking parts and mark any remaining running tools as done
          const parts = (msg.parts || [])
            .filter((p, i, arr) => {
              // Remove trailing thinking parts
              if (p.type === "thinking") {
                const hasNonThinkingAfter = arr
                  .slice(i + 1)
                  .some((q) => q.type !== "thinking");
                return hasNonThinkingAfter;
              }
              return true;
            })
            .map((p) => {
              if (p.type === "tool_call" && p.toolCall?.isRunning) {
                return {
                  ...p,
                  toolCall: { ...p.toolCall, isRunning: false },
                };
              }
              return p;
            });
          return { parts };
        });
        setIsLoading(false);
        break;

      case "error":
        updateLastAssistant((msg) => ({
          content:
            msg.content || `Agent error: ${event.message}`,
          parts: [
            ...(msg.parts || []),
            { type: "text", content: `\n\nError: ${event.message}` },
          ],
        }));
        break;
    }
  }

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. How can I help you with Tokamak governance?",
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    clearChat,
    mode,
    setMode,
  };
}
