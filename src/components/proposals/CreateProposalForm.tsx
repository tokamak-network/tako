"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionBuilderList, type BuiltAction } from "./ActionBuilder";
import {
  useTONBalance,
  useTONAllowance,
  useApproveTON,
  usePropose,
  useGovernanceParams,
  useProposalThreshold,
  useVotingPower,
  useContracts,
} from "@/hooks/contracts";

type Step = "form" | "approving" | "proposing" | "done";

export function CreateProposalForm() {
  const router = useRouter();
  const { address } = useAccount();
  const { addresses } = useContracts();

  const { data: tonBalance } = useTONBalance();
  const { data: govParams } = useGovernanceParams();
  const { data: threshold } = useProposalThreshold();
  const { data: votingPower } = useVotingPower();
  const { data: allowance, refetch: refetchAllowance } = useTONAllowance(addresses.daoGovernor);

  const { approve, isLoading: approving, isConfirmed: approveConfirmed, reset: resetApprove } = useApproveTON();
  const { propose, isLoading: proposing, isConfirmed: proposeConfirmed, hash: proposeHash } = usePropose();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [burnRate, setBurnRate] = useState("0");
  const [actions, setActions] = useState<BuiltAction[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [step, setStep] = useState<Step>("form");

  const creationCost = govParams?.proposalCreationCost ?? 10;
  const hasEnoughTON = (tonBalance ?? 0) >= creationCost;
  const hasEnoughVotingPower = (votingPower ?? 0) >= (threshold ?? 0);
  const needsApproval = (allowance ?? 0) < creationCost;
  const actionsValid = actions.length === 0 || actions.every((a) => a.isValid);
  const canSubmit = title.trim() && hasEnoughTON && hasEnoughVotingPower && actionsValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const costWei = parseUnits(creationCost.toString(), 18);

    if (needsApproval) {
      setStep("approving");
      approve(addresses.daoGovernor, costWei);
      return;
    }

    submitProposal();
  };

  const submitProposal = () => {
    setStep("proposing");
    const fullDescription = `# ${title}\n\n${description}`;
    const targets = actions.map((a) => a.target);
    const values = actions.map((a) => BigInt(a.value));
    const calldatas = actions.map((a) => a.calldata);

    if (targets.length === 0) {
      targets.push(addresses.daoGovernor);
      values.push(BigInt(0));
      calldatas.push("0x");
    }

    propose(targets, values, calldatas, fullDescription, Number(burnRate));
  };

  // Watch for approve confirmation → proceed to propose
  if (step === "approving" && approveConfirmed) {
    resetApprove();
    refetchAllowance();
    submitProposal();
  }

  // Watch for proposal confirmation → redirect
  if (step === "proposing" && proposeConfirmed && proposeHash) {
    setStep("done");
    setTimeout(() => router.push("/proposals"), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Requirements */}
      <Card variant="outlined">
        <CardContent>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Requirements</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">TON for creation fee</span>
              <div className="flex items-center gap-2">
                <span className={hasEnoughTON ? "text-[var(--color-success-500)]" : "text-[var(--status-error-fg)]"}>
                  {tonBalance?.toFixed(2) ?? "—"} / {creationCost} TON
                </span>
                {hasEnoughTON ? (
                  <Badge variant="success" size="sm">OK</Badge>
                ) : (
                  <Badge variant="error" size="sm">Insufficient</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Voting power (vTON)</span>
              <div className="flex items-center gap-2">
                <span className={hasEnoughVotingPower ? "text-[var(--color-success-500)]" : "text-[var(--status-error-fg)]"}>
                  {votingPower?.toFixed(2) ?? "—"} / {threshold?.toFixed(2) ?? "—"} vTON
                </span>
                {hasEnoughVotingPower ? (
                  <Badge variant="success" size="sm">OK</Badge>
                ) : (
                  <Badge variant="error" size="sm">Below threshold</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposal details */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A clear, concise title for your proposal"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block">Description (Markdown)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the motivation, details, and expected outcomes..."
                rows={8}
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block">Burn Rate (%)</label>
              <Input
                value={burnRate}
                onChange={(e) => setBurnRate(e.target.value)}
                placeholder="0"
                type="number"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Percentage of creation cost to burn (0-100)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Actions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowActions(!showActions)}>
              {showActions ? "Hide" : "Show"} ({actions.length})
            </Button>
          </div>
        </CardHeader>
        {showActions && (
          <CardContent>
            <ActionBuilderList actions={actions} onActionsChange={setActions} />
            {actions.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)] mt-2">
                No actions added. Proposal will be informational only.
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => router.push("/proposals")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || !address}
          loading={step === "approving" || step === "proposing"}
        >
          {step === "approving"
            ? "Approving TON..."
            : step === "proposing"
              ? "Creating Proposal..."
              : step === "done"
                ? "Proposal Created!"
                : needsApproval
                  ? `Approve & Create (${creationCost} TON)`
                  : "Create Proposal"}
        </Button>
      </div>

      {step === "done" && (
        <p className="text-sm text-[var(--color-success-500)]">
          Proposal created successfully! Redirecting...
        </p>
      )}
    </div>
  );
}
