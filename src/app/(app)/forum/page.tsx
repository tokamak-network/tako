"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForumAgendas } from "@/hooks/useForumAgenda";
import { formatDate } from "@/lib/utils";
import type { ForumAgendaStatus } from "../../../../shared/types";

const STATUS_TABS: { label: string; value?: string }[] = [
  { label: "All" },
  { label: "RFC", value: "rfc" },
  { label: "Snapshot", value: "snapshot" },
  { label: "Review", value: "review" },
  { label: "On-chain", value: "onchain" },
  { label: "Executed", value: "executed" },
];

const STATUS_VARIANT: Record<string, "primary" | "success" | "error" | "warning" | "outline"> = {
  draft: "outline",
  rfc: "primary",
  snapshot: "warning",
  review: "warning",
  onchain: "primary",
  executed: "success",
  rejected: "error",
  withdrawn: "outline",
};

export default function ForumPage() {
  const [filter, setFilter] = useState<string | undefined>();
  const { data, isLoading, isError } = useForumAgendas({ status: filter });

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forum</h1>
        <Link href="/forum/create">
          <Button>New RFC</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[var(--space-1)] flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.label}
            variant={filter === tab.value ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Agenda list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
          ))}
        </div>
      ) : isError ? (
        <Card padding="lg">
          <p className="text-center text-[var(--text-tertiary)]">
            Forum is not available. Make sure the agent server is running.
          </p>
        </Card>
      ) : data && data.agendas.length > 0 ? (
        <div className="space-y-3">
          {data.agendas.map((agenda) => (
            <Link key={agenda.id} href={`/forum/${agenda.id}`}>
              <Card interactive padding="md" className="mb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--text-tertiary)]">{agenda.tipNumber}</span>
                      <Badge
                        variant={STATUS_VARIANT[agenda.status] ?? "outline"}
                        size="sm"
                      >
                        {agenda.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{agenda.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
                      <span>by {agenda.author}</span>
                      <span>{formatDate(new Date(agenda.createdAt).getTime())}</span>
                      <span>{agenda.commentCount} comments</span>
                      <span>{agenda.opinionCount} opinions</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card padding="lg">
          <p className="text-center text-[var(--text-tertiary)]">No agendas found</p>
        </Card>
      )}
    </div>
  );
}
