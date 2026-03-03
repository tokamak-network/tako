"use client";

import { useState } from "react";
import Link from "next/link";
import { useGovernance } from "@/providers/governance/GovernanceProvider";
import { Card } from "@/components/ui/card";
import { StatusBadge, GovernanceSystemBadge } from "@/components/ui/badge";
import { VotingProgress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatAddress, formatDate } from "@/lib/utils";
import type { ProposalStatus } from "../../../../shared/types";

const FILTERS: { label: string; value: ProposalStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Executed", value: "executed" },
  { label: "Defeated", value: "defeated" },
];

export default function ProposalsPage() {
  const [filter, setFilter] = useState<ProposalStatus | undefined>(undefined);
  const { useProposals } = useGovernance();
  const { data: proposals, isLoading } = useProposals(filter);

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <Link href="/proposals/create">
          <Button>Create Proposal</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[var(--space-1)] flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f.label}
            variant={filter === f.value ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Proposal list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
          ))}
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className="space-y-4">
          {proposals.map((p) => (
            <Link key={p.id} href={`/proposals/${p.id}`}>
              <Card interactive padding="md" className="mb-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--text-tertiary)]">#{p.id}</span>
                      <StatusBadge status={p.status} size="sm" />
                      <GovernanceSystemBadge system={p.governanceSystem} size="sm" />
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] truncate-2">
                      {p.title}
                    </h3>
                  </div>
                </div>
                <VotingProgress
                  forVotes={p.forVotes}
                  againstVotes={p.againstVotes}
                  abstainVotes={p.abstainVotes}
                  showLabels
                />
                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                  <span>by {formatAddress(p.proposer)}</span>
                  <span>Ends {formatDate(p.endTime * 1000)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card padding="lg">
          <p className="text-center text-[var(--text-tertiary)]">
            No proposals found
          </p>
        </Card>
      )}
    </div>
  );
}
