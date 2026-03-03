"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { inferMood } from "@/lib/mood";
import { streamChat, checkAgentHealth } from "@/lib/agent-client";
import { MoodImage } from "@/components/character/MoodImage";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Proposal } from "../../../shared/types";
import type { Mood } from "@/providers/character/types";
import type { ChatSSEEvent, MessagePart } from "../../../shared/agent-types";

export function ProposalAnalysisPanel({ proposal }: { proposal: Proposal }) {
  const [content, setContent] = useState("");
  const [parts, setParts] = useState<MessagePart[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mood, setMood] = useState<Mood>("welcome");
  const [agentAvailable, setAgentAvailable] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check agent availability on mount
  useEffect(() => {
    checkAgentHealth().then(setAgentAvailable);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Auto-scroll during streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, parts]);

  const analyze = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setContent("");
    setParts([]);
    setIsAnalyzing(true);
    setMood("thinking");

    const prompt = [
      `Analyze this governance proposal:`,
      ``,
      `**Proposal #${proposal.id}: ${proposal.title}**`,
      ``,
      proposal.description,
    ].join("\n");

    try {
      const stream = streamChat(
        {
          messages: [{ role: "user", content: prompt }],
          mode: "analyze_proposal",
        },
        controller.signal
      );

      let accumulated = "";

      for await (const event of stream) {
        if (controller.signal.aborted) break;

        switch (event.type) {
          case "text_delta":
            accumulated += event.content;
            setContent(accumulated);
            setParts((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last?.type === "text") {
                updated[updated.length - 1] = {
                  ...last,
                  content: (last.content || "") + event.content,
                };
              } else {
                updated.push({ type: "text", content: event.content });
              }
              return updated;
            });
            break;

          case "tool_use":
            setParts((prev) => [
              ...prev,
              {
                type: "tool_call",
                toolCall: {
                  id: event.tool_id,
                  name: event.name,
                  isRunning: true,
                },
              },
            ]);
            break;

          case "tool_result":
            setParts((prev) =>
              prev.map((p) =>
                p.type === "tool_call" && p.toolCall?.id === event.tool_id
                  ? {
                      ...p,
                      toolCall: {
                        ...p.toolCall,
                        isRunning: false,
                        result: event.result,
                        isError: event.is_error,
                      },
                    }
                  : p
              )
            );
            break;

          case "thinking":
            setParts((prev) => [...prev, { type: "thinking" }]);
            break;

          case "done":
            setParts((prev) =>
              prev
                .filter((p, i, arr) => {
                  if (p.type === "thinking") {
                    return arr.slice(i + 1).some((q) => q.type !== "thinking");
                  }
                  return true;
                })
                .map((p) =>
                  p.type === "tool_call" && p.toolCall?.isRunning
                    ? { ...p, toolCall: { ...p.toolCall, isRunning: false } }
                    : p
                )
            );
            break;

          case "error":
            accumulated += `\n\nError: ${event.message}`;
            setContent(accumulated);
            break;
        }
      }

      if (!controller.signal.aborted) {
        setMood(inferMood(accumulated));
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setContent(`Could not connect to the analysis agent. (${msg})`);
        setMood("explain");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsAnalyzing(false);
      }
    }
  }, [proposal]);

  // Agent not available — show static fallback
  if (agentAvailable === false) {
    return null;
  }

  // Still checking agent — don't render yet
  if (agentAvailable === null) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MoodImage mood={isAnalyzing ? "thinking" : mood} size={28} />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!content && !isAnalyzing && (
          <div className="text-center space-y-3">
            <p className="text-sm text-[var(--text-tertiary)]">
              Get an AI-powered analysis of this proposal&apos;s safety and impact.
            </p>
            <Button variant="secondary" onClick={analyze} size="sm">
              Analyze Proposal
            </Button>
          </div>
        )}

        {(isAnalyzing || content) && (
          <div
            ref={scrollRef}
            className="text-sm leading-relaxed text-[var(--text-secondary)] max-h-[400px] overflow-y-auto space-y-1"
          >
            <AnalysisParts parts={parts} />
            {isAnalyzing && (
              <span className="animate-pulse text-[var(--color-primary-400)]">
                {" "}|
              </span>
            )}
          </div>
        )}

        {content && !isAnalyzing && (
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)]">
            <Button variant="ghost" size="sm" onClick={analyze}>
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisParts({ parts }: { parts: MessagePart[] }) {
  return (
    <>
      {parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return (
              <span key={i} className="whitespace-pre-wrap">
                {part.content}
              </span>
            );
          case "tool_call":
            return (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 my-0.5 rounded text-xs font-mono",
                  part.toolCall?.isRunning
                    ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)]"
                    : part.toolCall?.isError
                      ? "bg-[var(--color-error)]/15 text-[var(--color-error)]"
                      : "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                )}
              >
                {part.toolCall?.isRunning ? (
                  <>
                    <span className="animate-pulse">&#9679;</span>
                    {part.toolCall.name}...
                  </>
                ) : (
                  <>&#10003; {part.toolCall?.name}</>
                )}
              </span>
            );
          case "thinking":
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] animate-pulse"
              >
                Thinking...
              </span>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
