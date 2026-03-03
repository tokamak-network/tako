"use client";

import { cn } from "@/lib/utils";
import { useCharacter } from "@/providers/character/CharacterProvider";

export function ChatBubble() {
  const { isChatOpen, toggleChat } = useCharacter();

  return (
    <button
      type="button"
      onClick={toggleChat}
      className={cn(
        "fixed bottom-6 right-6 z-[var(--z-popover)]",
        "size-14 rounded-full",
        "bg-[var(--color-primary-500)] text-white",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-[var(--duration-normal)]",
        "hover:scale-110 active:scale-95",
        "flex items-center justify-center",
        isChatOpen && "rotate-45"
      )}
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      {isChatOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full bg-[var(--color-primary-400)] animate-ping opacity-20 pointer-events-none" />
    </button>
  );
}
