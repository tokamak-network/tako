/**
 * Agent SSE client — pure functions, no React dependency.
 * Connects to dao-agent POST /api/chat SSE endpoint.
 */

import type { ChatSSEEvent, AgentChatRequest } from "../../shared/agent-types";

const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3333";

/**
 * Check if the agent server is reachable.
 * Returns true if /api/health responds within 3 seconds.
 */
export async function checkAgentHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AGENT_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Stream chat from the agent server via SSE.
 * Uses fetch + ReadableStream (EventSource doesn't support POST).
 *
 * Yields ChatSSEEvent objects parsed from `data:` lines.
 * Supports cancellation via AbortSignal.
 */
export async function* streamChat(
  request: AgentChatRequest,
  signal?: AbortSignal
): AsyncGenerator<ChatSSEEvent> {
  const res = await fetch(`${AGENT_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Agent server error: ${res.status} ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("No response body from agent server");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split("\n");
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6); // Remove "data: " prefix
        try {
          const event = JSON.parse(jsonStr) as ChatSSEEvent;
          yield event;
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data: ")) {
        try {
          const event = JSON.parse(trimmed.slice(6)) as ChatSSEEvent;
          yield event;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
