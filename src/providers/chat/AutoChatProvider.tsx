"use client";

import React, { useState, useEffect } from "react";
import { ChatProvider } from "./ChatProvider";
import { AgentChatProvider } from "./AgentChatProvider";
import { checkAgentHealth } from "@/lib/agent-client";

/**
 * Auto-switching chat provider:
 * - Agent server reachable → AgentChatProvider (real SSE streaming)
 * - Agent server unreachable → ChatProvider (keyword-matching dummy)
 *
 * Health check runs once on mount. Defaults to dummy while checking.
 */
export function AutoChatProvider({ children }: { children: React.ReactNode }) {
  const [agentAvailable, setAgentAvailable] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAgentHealth().then((ok) => {
      setAgentAvailable(ok);
      setChecked(true);
    });
  }, []);

  // Before health check completes or if agent unavailable, use dummy
  if (!checked || !agentAvailable) {
    return <ChatProvider>{children}</ChatProvider>;
  }

  return <AgentChatProvider>{children}</AgentChatProvider>;
}
