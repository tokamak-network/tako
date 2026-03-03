"use client";

import { useAccount, useBlock } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useQueueProposal,
  useExecuteProposal,
  useCancelProposal,
  useProposalEta,
} from "@/hooks/contracts";
import type { Proposal } from "../../../shared/types";

export function ProposalActions({ proposal }: { proposal: Proposal }) {
  const { address } = useAccount();
  const { queue, isLoading: queueing } = useQueueProposal();
  const { execute, isLoading: executing } = useExecuteProposal();
  const { cancel, isLoading: canceling } = useCancelProposal();
  const { data: eta } = useProposalEta(proposal.id);
  const { data: block } = useBlock();

  const isProposer = address?.toLowerCase() === proposal.proposer.toLowerCase();
  const now = block ? Number(block.timestamp) : 0;
  const etaPassed = eta != null && now > 0 ? now >= eta : false;

  const showQueue = proposal.status === "succeeded";
  const showExecute = proposal.status === "queued" && etaPassed;
  const showCancel = isProposer && ["pending", "active", "succeeded"].includes(proposal.status);

  if (!showQueue && !showExecute && !showCancel) return null;

  return (
    <Card>
      <CardContent>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {showQueue && (
            <Button onClick={() => queue(proposal.id)} loading={queueing} size="sm">
              Queue for Execution
            </Button>
          )}
          {showExecute && (
            <Button onClick={() => execute(proposal.id)} loading={executing} size="sm">
              Execute
            </Button>
          )}
          {proposal.status === "queued" && !etaPassed && eta && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Executable after {new Date(eta * 1000).toLocaleString()}
            </p>
          )}
          {showCancel && (
            <Button variant="destructive" onClick={() => cancel(proposal.id)} loading={canceling} size="sm">
              Cancel Proposal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
