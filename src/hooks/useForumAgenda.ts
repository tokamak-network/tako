"use client";

import { useQuery } from "@tanstack/react-query";
import { listAgendas, getAgenda, listComments, getQocResult, type AgendaListParams } from "@/lib/forum-client";
import type { ForumAgendaListItem, ForumAgenda, ForumComment } from "../../shared/types";
import type { QocAggregatedResult } from "@/types/qoc";

export function useForumAgendas(params?: AgendaListParams) {
  return useQuery({
    queryKey: ["forumAgendas", params],
    queryFn: async () => {
      const result = await listAgendas(params);
      return result as { agendas: ForumAgendaListItem[]; total: number };
    },
    staleTime: 30_000,
  });
}

export function useForumAgenda(id: number) {
  return useQuery({
    queryKey: ["forumAgenda", id],
    queryFn: () => getAgenda(id) as Promise<ForumAgenda>,
    enabled: id > 0,
    staleTime: 30_000,
  });
}

export function useForumComments(agendaId: number) {
  return useQuery({
    queryKey: ["forumComments", agendaId],
    queryFn: () => listComments(agendaId) as Promise<ForumComment[]>,
    enabled: agendaId > 0,
    staleTime: 30_000,
  });
}

export function useQocResult(agendaId: number) {
  return useQuery({
    queryKey: ["qocResult", agendaId],
    queryFn: () => getQocResult(agendaId) as Promise<QocAggregatedResult>,
    enabled: agendaId > 0,
    staleTime: 60_000,
  });
}
