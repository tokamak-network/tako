"use client";

import Link from "next/link";
import { useGovernance } from "@/providers/governance/GovernanceProvider";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, GovernanceSystemBadge } from "@/components/ui/badge";
import { VotingProgress } from "@/components/ui/progress";
import { AddressAvatar } from "@/components/ui/avatar";
import { formatNumber, formatAddress } from "@/lib/utils";
import { CharacterHero } from "@/components/dashboard/CharacterHero";

function MetricsGrid() {
  const { useDashboardMetrics } = useGovernance();
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="card-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
        ))}
      </div>
    );
  }

  return (
    <div className="card-grid">
      <StatCard label="Total vTON Supply" value={formatNumber(metrics.totalVTONSupply, { compact: true })} />
      <StatCard label="Active Proposals" value={metrics.activeProposals} />
      <StatCard label="Total Delegates" value={metrics.totalDelegates} />
      <StatCard label="Total Delegators" value={formatNumber(metrics.totalDelegators)} />
      <StatCard label="Treasury Balance" value={`${formatNumber(metrics.treasuryBalance, { compact: true })} TON`} />
      <StatCard label="Participation Rate" value={`${metrics.participationRate}%`} />
    </div>
  );
}

function ActiveProposals() {
  const { useProposals } = useGovernance();
  const { data: proposals, isLoading } = useProposals("active");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse-soft" />
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-3">
            {proposals.map((p) => (
              <Link
                key={p.id}
                href={`/proposals/${p.id}`}
                className="block p-3 rounded-lg border border-[var(--border-secondary)] hover:border-[var(--border-primary)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate pr-4">
                    {p.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={p.status} size="sm" />
                    <GovernanceSystemBadge system={p.governanceSystem} size="sm" />
                  </div>
                </div>
                <VotingProgress
                  forVotes={p.forVotes}
                  againstVotes={p.againstVotes}
                  abstainVotes={p.abstainVotes}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">
            No active proposals
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TopDelegates() {
  const { useDelegates } = useGovernance();
  const { data: delegates, isLoading } = useDelegates();

  const top = delegates?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Delegates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[var(--bg-secondary)] rounded-lg animate-pulse-soft" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {top.map((d, i) => (
              <Link
                key={d.address}
                href={`/delegates`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <span className="text-sm font-medium text-[var(--text-tertiary)] w-5">{i + 1}</span>
                <AddressAvatar address={d.address} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {d.name || formatAddress(d.address)}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {formatNumber(d.votingPower, { compact: true })} vTON
                  </p>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {d.voteParticipation}%
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyStatus() {
  const { useUserStatus } = useGovernance();
  const { data: status, isLoading } = useUserStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !status ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-[var(--bg-secondary)] rounded animate-pulse-soft" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-tertiary)]">vTON Balance</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {formatNumber(status.vtonBalance)} vTON
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-tertiary)]">Voting Power</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {formatNumber(status.votingPower)} vTON
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-tertiary)]">Delegated To</span>
              <span className="text-sm font-medium text-[var(--text-brand)]">
                {status.delegatedTo ? formatAddress(status.delegatedTo) : "Not delegated"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-[var(--space-6)]">
      <CharacterHero />
      <MetricsGrid />
      <div className="grid gap-[var(--space-6)] lg:grid-cols-2">
        <ActiveProposals />
        <div className="space-y-[var(--space-6)]">
          <MyStatus />
          <TopDelegates />
        </div>
      </div>
    </div>
  );
}
