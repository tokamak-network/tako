"use client";

import { AddressAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatAddress, formatNumber } from "@/lib/utils";
import { useDelegateVotingHistory } from "@/hooks/contracts";
import type { DelegateInfo, DelegateProfile as DelegateProfileType } from "../../../shared/types";
import { VoteType } from "../../../shared/types";

const VOTE_LABELS: Record<number, { label: string; color: string }> = {
  [VoteType.For]: { label: "For", color: "text-[var(--color-vote-for)]" },
  [VoteType.Against]: { label: "Against", color: "text-[var(--color-vote-against)]" },
  [VoteType.Abstain]: { label: "Abstain", color: "text-[var(--color-vote-abstain)]" },
};

export function DelegateProfileView({
  delegate,
  profile,
}: {
  delegate: DelegateInfo;
  profile?: DelegateProfileType | null;
}) {
  const { votes, stats, isLoading } = useDelegateVotingHistory(delegate.address);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Profile (sticky) */}
      <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center text-center">
              <AddressAvatar address={delegate.address} size="xl" />
              <h2 className="text-lg font-bold text-[var(--text-primary)] mt-3">
                {delegate.name || profile?.name || formatAddress(delegate.address)}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)] font-mono mt-1">
                {formatAddress(delegate.address)}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="primary">{formatNumber(delegate.votingPower, { compact: true })} vTON</Badge>
                <Badge variant="outline">{delegate.delegators} delegators</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {(delegate.statement || profile?.bio) && (
          <Card>
            <CardHeader><CardTitle>Statement</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)]">
                {delegate.statement || profile?.bio}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Voting Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">Total Votes</span>
                <span className="text-[var(--text-primary)]">{stats.totalVotes}</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
                  <span>For</span><span>{stats.forRate}%</span>
                </div>
                <Progress value={stats.forRate} className="bg-[var(--color-vote-for)]" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
                  <span>Against</span><span>{stats.againstRate}%</span>
                </div>
                <Progress value={stats.againstRate} className="bg-[var(--color-vote-against)]" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
                  <span>Abstain</span><span>{stats.abstainRate}%</span>
                </div>
                <Progress value={stats.abstainRate} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Voting History */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Voting History</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse-soft" />
            ))}
          </div>
        ) : votes.length > 0 ? (
          <div className="space-y-2">
            {votes.map((vote) => {
              const voteInfo = VOTE_LABELS[vote.support] ?? VOTE_LABELS[2];
              return (
                <Card key={`${vote.proposalId}-${vote.blockNumber}`} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Proposal #{vote.proposalId}
                      </span>
                      {vote.reason && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                          {vote.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {formatNumber(vote.weight)} vTON
                      </span>
                      <Badge variant={vote.support === VoteType.For ? "success" : vote.support === VoteType.Against ? "error" : "outline"} size="sm">
                        {voteInfo.label}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="lg">
            <p className="text-center text-[var(--text-tertiary)]">No voting history</p>
          </Card>
        )}
      </div>
    </div>
  );
}
