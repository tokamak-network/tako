/**
 * Forum API client for dao-agent server.
 * Endpoints match ~/workspace/tokamak-dao-agent/src/web/forum/router.ts
 */

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3333";

async function fetchForum<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${AGENT_URL}/api/forum${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Forum API error: ${res.status}`);
  return res.json();
}

// --- Agenda ---

export interface AgendaListParams {
  status?: string;
  limit?: number;
  offset?: number;
  sort?: "newest" | "oldest";
}

export async function listAgendas(params?: AgendaListParams) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.sort) query.set("sort", params.sort);
  return fetchForum<{ agendas: unknown[]; total: number }>(`/agenda?${query}`);
}

export async function getAgenda(id: number) {
  return fetchForum<unknown>(`/agenda/${id}`);
}

export async function createAgenda(data: {
  title: string;
  abstract: string;
  motivation: string;
  specification: string;
  rationale: string;
  securityConsiderations: string;
  expectedOutcomes: string;
  author: string;
}) {
  return fetchForum<unknown>("/agenda", { method: "POST", body: JSON.stringify(data) });
}

// --- Comments ---

export async function listComments(agendaId: number) {
  return fetchForum<unknown[]>(`/agenda/${agendaId}/comments`);
}

export async function createComment(agendaId: number, data: { author: string; content: string }) {
  return fetchForum<unknown>(`/agenda/${agendaId}/comment`, { method: "POST", body: JSON.stringify(data) });
}

// --- QOC ---

export async function getQocResult(agendaId: number) {
  return fetchForum<unknown>(`/agenda/${agendaId}/qoc/result`);
}

export async function evaluateQoc(agendaId: number) {
  return fetchForum<unknown>(`/agenda/${agendaId}/qoc/evaluate`, { method: "POST" });
}

// --- Translation ---

export async function translateText(text: string, targetLang: string = "ko") {
  const res = await fetch(`${AGENT_URL}/api/forum/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  if (!res.ok) throw new Error("Translation failed");
  return res.json() as Promise<{ translated: string }>;
}
