"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGovernance } from "@/providers/governance/GovernanceProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, GovernanceSystemBadge } from "@/components/ui/badge";
import { VotingProgress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { AddressAvatar } from "@/components/ui/avatar";
import { ProposalAnalysisPanel } from "@/components/proposals/ProposalAnalysisPanel";
import { useCharacter } from "@/providers/character/CharacterProvider";
import { useChat } from "@/providers/chat/context";
import { formatAddress, formatDate, formatNumber } from "@/lib/utils";
import { VoteType } from "../../../../../shared/types";

const VOTE_OPTIONS = [
  { type: VoteType.For, label: "For", color: "text-[var(--color-vote-for)]", bg: "bg-[var(--color-vote-for)]" },
  { type: VoteType.Against, label: "Against", color: "text-[var(--color-vote-against)]", bg: "bg-[var(--color-vote-against)]" },
  { type: VoteType.Abstain, label: "Abstain", color: "text-[var(--color-vote-abstain)]", bg: "bg-[var(--color-vote-abstain)]" },
];

function VotingModal({
  open,
  onClose,
  proposalId,
}: {
  open: boolean;
  onClose: () => void;
  proposalId: string;
}) {
  const [selected, setSelected] = useState<VoteType | null>(null);
  const [reason, setReason] = useState("");
  const { useCastVote } = useGovernance();
  const { castVote, isLoading } = useCastVote();

  const handleVote = async () => {
    if (selected === null) return;
    await castVote(proposalId, selected, reason);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Cast Your Vote" size="sm">
      <ModalBody>
        <div className="space-y-3">
          {VOTE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setSelected(opt.type)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                selected === opt.type
                  ? `border-current ${opt.color} bg-[var(--bg-secondary)]`
                  : "border-[var(--border-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-primary)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`size-4 rounded-full border-2 ${
                  selected === opt.type ? `${opt.bg} border-current` : "border-[var(--border-primary)]"
                }`} />
                <span className="font-medium">{opt.label}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-sm text-[var(--text-secondary)] mb-1 block">
            Reason (optional)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you voting this way?"
            rows={3}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleVote}
          disabled={selected === null}
          loading={isLoading}
        >
          Submit Vote
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DiscussButton({ proposalTitle }: { proposalTitle: string }) {
  const { openChat } = useCharacter();
  const { sendMessage } = useChat();

  const handleDiscuss = () => {
    openChat();
    sendMessage(`What does this proposal do and is it safe? "${proposalTitle}"`);
  };

  return (
    <Button variant="secondary" onClick={handleDiscuss}>
      Discuss with AI
    </Button>
  );
}

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { useProposal } = useGovernance();
  const { data: proposal, isLoading } = useProposal(id);
  const [votingOpen, setVotingOpen] = useState(false);

  if (isLoading || !proposal) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse-soft" />
        <div className="h-64 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
      </div>
    );
  }

  const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  const quorumMet = totalVotes >= (proposal.totalVotingPower * proposal.quorum) / 100;

  return (
    <div className="space-y-[var(--space-6)]">
      {/* Back link */}
      <Link href="/proposals" className="text-sm text-[var(--text-brand)] hover:underline">
        &larr; Back to proposals
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-[var(--text-tertiary)]">Proposal #{proposal.id}</span>
            <StatusBadge status={proposal.status} />
            <GovernanceSystemBadge system={proposal.governanceSystem} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{proposal.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <AddressAvatar address={proposal.proposer} size="xs" />
            <span className="text-sm text-[var(--text-secondary)]">
              by {formatAddress(proposal.proposer)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DiscussButton proposalTitle={proposal.title} />
          {proposal.status === "active" && (
            <Button onClick={() => setVotingOpen(true)}>Vote</Button>
          )}
        </div>
      </div>

      <div className="grid gap-[var(--space-6)] lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="proposal-prose whitespace-pre-wrap">
                {proposal.description}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-[var(--space-4)]">
          {/* Voting results */}
          <Card>
            <CardHeader>
              <CardTitle>Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <VotingProgress
                forVotes={proposal.forVotes}
                againstVotes={proposal.againstVotes}
                abstainVotes={proposal.abstainVotes}
                showLabels
              />
              <div className="mt-4 pt-4 border-t border-[var(--border-secondary)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-tertiary)]">Quorum</span>
                  <span className={quorumMet ? "text-[var(--color-success-500)]" : "text-[var(--text-secondary)]"}>
                    {quorumMet ? "Reached" : `${proposal.quorum}% needed`}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[var(--text-tertiary)]">Total votes</span>
                  <span className="text-[var(--text-secondary)]">{formatNumber(totalVotes)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-tertiary)]">Start</span>
                  <span className="text-[var(--text-secondary)]">{formatDate(proposal.startTime * 1000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-tertiary)]">End</span>
                  <span className="text-[var(--text-secondary)]">{formatDate(proposal.endTime * 1000)}</span>
                </div>
                {proposal.eta && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Execution</span>
                    <span className="text-[var(--text-secondary)]">{formatDate(proposal.eta * 1000)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Governance System */}
          <Card>
            <CardHeader>
              <CardTitle>Governance System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-tertiary)]">System</span>
                  <GovernanceSystemBadge system={proposal.governanceSystem} size="sm" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-tertiary)]">Mechanism</span>
                  <span className="text-[var(--text-secondary)]">
                    {proposal.governanceSystem === "v1" ? "Committee Vote" : "Token Vote"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-secondary)]">
                  {proposal.governanceSystem === "v1"
                    ? "V1 DAOCommittee — 3-member committee vote (2/3 quorum). Migration agenda executed through v1."
                    : "V2 DAOGovernor — vTON token-weighted vote with 4% quorum and 7-day timelock."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <ProposalAnalysisPanel proposal={proposal} />
        </div>
      </div>

      <VotingModal
        open={votingOpen}
        onClose={() => setVotingOpen(false)}
        proposalId={id}
      />
    </div>
  );
}
