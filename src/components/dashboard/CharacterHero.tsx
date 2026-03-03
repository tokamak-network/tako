"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { MoodImage } from "@/components/character/MoodImage";
import { useTypewriter } from "@/components/character/Typewriter";
import { useGovernance } from "@/providers/governance/GovernanceProvider";
import { useCharacter } from "@/providers/character/CharacterProvider";
import { Button } from "@/components/ui/button";
import type { Mood } from "@/providers/character/types";

// --- Contextual greeting logic ---

interface Action {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

interface Greeting {
  text: string;
  mood: Mood;
  actions: Action[];
}

function useDashboardGreeting(): Greeting {
  const { useDashboardMetrics, useUserStatus } = useGovernance();
  const { data: metrics } = useDashboardMetrics();
  const { data: userStatus } = useUserStatus();

  return useMemo(() => {
    // Priority 1: Not delegated
    if (userStatus && !userStatus.delegatedTo) {
      return {
        text: "vTON을 위임하면 투표에 참여할 수 있어요! 위임할 대표를 선택해 보세요.",
        mood: "explain" as Mood,
        actions: [
          { label: "위임하기", href: "/delegates", variant: "primary" },
          { label: "안건 보기", href: "/proposals", variant: "secondary" },
        ],
      };
    }

    // Priority 2: Active proposals exist
    if (metrics && metrics.activeProposals > 0) {
      return {
        text: `${metrics.activeProposals}개의 안건이 투표를 기다리고 있어요! 참여해 보시겠어요?`,
        mood: "excited" as Mood,
        actions: [
          { label: "안건 보기", href: "/proposals", variant: "primary" },
          { label: "위임 관리", href: "/delegates", variant: "secondary" },
        ],
      };
    }

    // Priority 3: No voting power
    if (userStatus && userStatus.votingPower === 0) {
      return {
        text: "아직 투표력이 없네요. vTON을 받고 위임하면 거버넌스에 참여할 수 있어요!",
        mood: "welcome" as Mood,
        actions: [
          { label: "위임하기", href: "/delegates", variant: "primary" },
        ],
      };
    }

    // Default
    return {
      text: "Tokamak DAO에 오신 걸 환영해요! 오늘도 거버넌스에 함께해 주세요.",
      mood: "welcome" as Mood,
      actions: [
        { label: "안건 보기", href: "/proposals", variant: "primary" },
        { label: "대표 보기", href: "/delegates", variant: "secondary" },
      ],
    };
  }, [metrics, userStatus]);
}

// --- Speech bubble with typewriter ---

function SpeechBubble({
  text,
  actions,
}: {
  text: string;
  actions: Action[];
}) {
  const { displayed, done } = useTypewriter(text, 30);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Bubble */}
      <div className="relative w-full">
        <div className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.1] px-5 py-4">
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">
            {displayed}
            {!done && (
              <span className="animate-pulse text-[var(--color-primary-400)]">
                |
              </span>
            )}
          </p>
        </div>
        {/* Triangle pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/[0.07] border-l border-t border-white/[0.1]" />
      </div>

      {/* Quick actions */}
      {done && actions.length > 0 && (
        <div className="flex gap-3 animate-[slide-up-fade_0.3s_ease-out]">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant={action.variant}
              size="sm"
              asChild
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main CharacterHero ---

export function CharacterHero() {
  const greeting = useDashboardGreeting();
  const { setMood } = useCharacter();

  // Sync mood with greeting
  useEffect(() => {
    setMood(greeting.mood);
  }, [greeting.mood, setMood]);

  return (
    <section className="relative flex flex-col items-center gap-5 py-8 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-900)]/20 via-transparent to-transparent pointer-events-none" />

      {/* Character image */}
      <div className="relative z-10 animate-float">
        <MoodImage mood={greeting.mood} size={160} />
      </div>

      {/* Speech bubble + actions */}
      <div className="relative z-10 w-full">
        <SpeechBubble text={greeting.text} actions={greeting.actions} />
      </div>
    </section>
  );
}
