"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { CharacterContextValue, Mood } from "./types";
import { inferMood } from "@/lib/mood";

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacter must be used within CharacterProvider");
  return ctx;
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
        inferMoodFromContent: inferMood,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}
