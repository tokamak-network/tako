"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { CharacterContextValue, Mood } from "./types";

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacter must be used within CharacterProvider");
  return ctx;
}

function inferMoodFromContent(content: string): Mood {
  const lower = content.toLowerCase();

  if (/loading|analyzing|processing|thinking|wait/i.test(lower)) return "thinking";
  if (/warning|risk|danger|caution|against|defeat/i.test(lower)) return "explain";
  if (/success|complete|passed|approved|executed|great|excellent/i.test(lower)) return "excited";

  return "welcome";
}

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<Mood>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);

  return (
    <CharacterContext.Provider
      value={{
        mood,
        isTyping,
        isChatOpen,
        setMood,
        setIsTyping,
        openChat,
        closeChat,
        toggleChat,
        inferMoodFromContent,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}
