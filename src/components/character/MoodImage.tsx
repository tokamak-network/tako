"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Mood } from "@/providers/character/types";

const MOOD_CONFIG: Record<Mood, { image: string; glow: string }> = {
  welcome: {
    image: "/character/toki-welcome.png",
    glow: "rgba(74, 144, 217, 0.4)",
  },
  explain: {
    image: "/character/toki-explain.png",
    glow: "rgba(96, 165, 250, 0.4)",
  },
  thinking: {
    image: "/character/toki-thinking.png",
    glow: "rgba(99, 102, 241, 0.4)",
  },
  excited: {
    image: "/character/toki-excited.png",
    glow: "rgba(245, 158, 11, 0.5)",
  },
};

interface MoodImageProps {
  mood: Mood;
  size?: number;
  className?: string;
}

export function MoodImage({ mood, size = 128, className }: MoodImageProps) {
  const config = MOOD_CONFIG[mood];

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-2xl animate-glow-pulse"
        style={{ backgroundColor: config.glow }}
      />
      {/* Character image */}
      <Image
        src={config.image}
        alt={`Character mood: ${mood}`}
        width={size}
        height={size}
        className="relative z-10 drop-shadow-lg transition-opacity duration-150"
        priority
      />
    </div>
  );
}
