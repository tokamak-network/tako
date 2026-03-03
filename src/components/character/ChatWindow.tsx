"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCharacter } from "@/providers/character/CharacterProvider";
import { useChat } from "@/providers/chat/ChatProvider";
import { MoodImage } from "./MoodImage";

export function ChatWindow() {
  const { mood, isChatOpen } = useCharacter();
  const { messages, input, setInput, sendMessage, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isChatOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-[var(--z-popover)]",
        "w-80 sm:w-96",
        "bg-[var(--surface-primary)] border border-[var(--border-secondary)]",
        "rounded-[var(--radius-2xl)]",
        "shadow-[var(--shadow-2xl)]",
        "animate-drop-in",
        "flex flex-col",
        "max-h-[70vh]"
      )}
    >
      {/* Character header */}
      <div className="relative h-32 flex items-center justify-center overflow-hidden rounded-t-[var(--radius-2xl)] bg-[var(--bg-secondary)]">
        <MoodImage mood={mood} size={96} />
        <div className="absolute bottom-2 left-4">
          <span className="text-xs font-medium text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-2 py-0.5 rounded-full">
            {mood}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "text-sm leading-relaxed",
              msg.role === "user"
                ? "ml-auto max-w-[80%] bg-[var(--bg-brand-subtle)] text-[var(--text-brand)] px-3 py-2 rounded-2xl rounded-br-sm"
                : "mr-auto max-w-[90%] text-[var(--text-secondary)]"
            )}
          >
            {msg.content}
            {msg.role === "assistant" && isLoading && i === messages.length - 1 && (
              <span className="animate-pulse text-[var(--color-primary-400)]"> |</span>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border-secondary)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about governance..."
            disabled={isLoading}
            className={cn(
              "flex-1 h-9 px-3 text-sm",
              "bg-[var(--input-bg)] text-[var(--input-text)]",
              "placeholder:text-[var(--input-placeholder)]",
              "border border-[var(--input-border)]",
              "rounded-[var(--radius-lg)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--input-border-focus)]",
              "disabled:opacity-50"
            )}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "h-9 px-3 text-sm font-medium rounded-[var(--radius-lg)]",
              "bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)]",
              "hover:bg-[var(--button-primary-bg-hover)]",
              "disabled:opacity-40 disabled:pointer-events-none",
              "transition-colors duration-[var(--duration-fast)]"
            )}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
