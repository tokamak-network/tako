export type Mood = "welcome" | "explain" | "thinking" | "excited";

export interface CharacterContextValue {
  mood: Mood;
  isTyping: boolean;
  isChatOpen: boolean;
  setMood: (mood: Mood) => void;
  setIsTyping: (typing: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  inferMoodFromContent: (content: string) => Mood;
}
