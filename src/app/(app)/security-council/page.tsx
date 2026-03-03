"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { encodeFunctionData } from "viem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressAvatar } from "@/components/ui/avatar";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useSecurityCouncilMembers,
  useSecurityCouncilThreshold,
  useIsSCMember,
  usePendingActions,
  useProposeEmergencyAction,
  useApproveAction,
  useExecuteAction,
} from "@/hooks/contracts";
import { formatAddress, formatDate } from "@/lib/utils";
import { ActionType, type EmergencyAction } from "../../../../shared/types";
import { DAO_GOVERNOR_ABI } from "../../../../shared/abi";

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  [ActionType.CancelProposal]: "Cancel Proposal",
  [ActionType.PauseProtocol]: "Pause Protocol",
  [ActionType.UnpauseProtocol]: "Unpause Protocol",
  [ActionType.EmergencyUpgrade]: "Emergency Upgrade",
};

function ActionCard({
  action,
  isMember,
  threshold,
}: {
  action: EmergencyAction;
  isMember: boolean;
  threshold: number;
}) {
  const { approve, isLoading: approving } = useApproveAction();
  const { execute, isLoading: executing } = useExecuteAction();

  const canExecute = action.approvalCount >= threshold && !action.executed && !action.canceled;

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={action.executed ? "success" : action.canceled ? "error" : "warning"} size="sm">
                {action.executed ? "Executed" : action.canceled ? "Canceled" : "Pending"}
              </Badge>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {ACTION_TYPE_LABELS[action.actionType] ?? "Unknown"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Proposed by {formatAddress(action.proposer)} · {formatDate(action.createdAt * 1000)}
            </p>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {action.approvalCount}/{threshold} approvals
          </div>
        </div>

        {action.reason && (
          <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2 rounded mb-3">
            {action.reason}
          </p>
        )}

        {isMember && !action.executed && !action.canceled && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => approve(action.id)} loading={approving}>
              Approve
            </Button>
            {canExecute && (
              <Button size="sm" variant="primary" onClick={() => execute(action.id)} loading={executing}>
                Execute
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CancelProposalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [proposalId, setProposalId] = useState("");
  const [reason, setReason] = useState("");
  const { propose, isLoading, isConfirmed } = useProposeEmergencyAction();

  const handleSubmit = () => {
    if (!proposalId || !reason) return;
    const calldata = encodeFunctionData({
      abi: DAO_GOVERNOR_ABI,
      functionName: "cancel",
      args: [BigInt(proposalId)],
    });
    propose(ActionType.CancelProposal, "0x0000000000000000000000000000000000000000", calldata, reason);
  };

  if (isConfirmed) {
    setTimeout(onClose, 2000);
    return (
      <Modal open={open} onClose={onClose} title="Emergency Action Proposed" size="sm">
        <ModalBody>
          <p className="text-center text-[var(--color-success-500)]">
            Emergency action proposed successfully. Other members can now approve it.
          </p>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Cancel Proposal (Emergency)" size="sm">
      <ModalBody>
        <div className="space-y-4">
          <div className="bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] p-3 rounded text-sm">
            This creates an emergency action that requires 2/3 Security Council approval.
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Proposal ID</label>
            <Input value={proposalId} onChange={(e) => setProposalId(e.target.value)} placeholder="Enter proposal ID" />
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Reason</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why should this proposal be canceled?" rows={3} />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={handleSubmit} loading={isLoading} disabled={!proposalId || !reason}>
          Propose Cancellation
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default function SecurityCouncilPage() {
  const { address } = useAccount();
  const { members, count, isLoading: membersLoading } = useSecurityCouncilMembers();
  const { data: threshold } = useSecurityCouncilThreshold();
  const { data: isMember, isLoading: memberCheckLoading } = useIsSCMember();
  const { actions, isLoading: actionsLoading } = usePendingActions();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // 3-layer access: public info, member actions, admin actions
  const showMemberActions = isMember;

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Council</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Emergency response multisig ({threshold ?? "—"}/{count} threshold)
          </p>
        </div>
        {showMemberActions && (
          <Button variant="destructive" onClick={() => setCancelModalOpen(true)}>
            Emergency Cancel
          </Button>
        )}
      </div>

      {/* Access indicator */}
      <Card variant="outlined" padding="sm">
        <div className="flex items-center gap-2 text-sm">
          {!address ? (
            <span className="text-[var(--text-tertiary)]">Connect wallet to check membership</span>
          ) : memberCheckLoading ? (
            <span className="text-[var(--text-tertiary)]">Checking membership...</span>
          ) : isMember ? (
            <>
              <Badge variant="success" size="sm">Member</Badge>
              <span className="text-[var(--text-secondary)]">You are a Security Council member</span>
            </>
          ) : (
            <>
              <Badge variant="outline" size="sm">Observer</Badge>
              <span className="text-[var(--text-tertiary)]">You can view but not take actions</span>
            </>
          )}
        </div>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({count})</CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-[var(--bg-secondary)] rounded animate-pulse-soft" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
                  <AddressAvatar address={m} size="sm" />
                  <span className="font-mono text-sm text-[var(--text-primary)]">{formatAddress(m)}</span>
                  {m.toLowerCase() === address?.toLowerCase() && (
                    <Badge variant="primary" size="sm">You</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Actions */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Pending Actions ({actions.filter((a) => !a.executed && !a.canceled).length})
        </h2>
        {actionsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
            ))}
          </div>
        ) : actions.length > 0 ? (
          <div className="space-y-3">
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                isMember={isMember}
                threshold={threshold ?? 2}
              />
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <p className="text-center text-[var(--text-tertiary)]">No pending actions</p>
          </Card>
        )}
      </div>

      <CancelProposalModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
