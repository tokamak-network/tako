"use client";

import { useState } from "react";
import { useGovernance } from "@/providers/governance/GovernanceProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddressAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { formatNumber, formatAddress } from "@/lib/utils";
import type { DelegateInfo } from "../../../../shared/types";

function DelegationModal({
  open,
  onClose,
  delegate,
}: {
  open: boolean;
  onClose: () => void;
  delegate: DelegateInfo | null;
}) {
  const { useDelegation: useDelegateAction, useUserStatus } = useGovernance();
  const { delegate: delegateTo, undelegate, isLoading } = useDelegateAction();
  const { data: userStatus } = useUserStatus();

  const isCurrentDelegate =
    delegate && userStatus?.delegatedTo?.toLowerCase() === delegate.address.toLowerCase();

  const handleAction = async () => {
    if (!delegate) return;
    if (isCurrentDelegate) {
      await undelegate();
    } else {
      await delegateTo(delegate.address);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCurrentDelegate ? "Undelegate" : "Delegate"}
      description={
        isCurrentDelegate
          ? "Remove your delegation and deactivate voting power"
          : `Delegate your vTON to ${delegate?.name || formatAddress(delegate?.address || "")}`
      }
      size="sm"
    >
      <ModalBody>
        {delegate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AddressAvatar address={delegate.address} size="lg" />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {delegate.name || formatAddress(delegate.address)}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {formatNumber(delegate.votingPower, { compact: true })} vTON
                </p>
              </div>
            </div>
            {delegate.statement && (
              <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg">
                {delegate.statement}
              </p>
            )}
            {userStatus && (
              <div className="text-sm text-[var(--text-tertiary)]">
                Your vTON balance: {formatNumber(userStatus.vtonBalance)} vTON
              </div>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          variant={isCurrentDelegate ? "destructive" : "primary"}
          onClick={handleAction}
          loading={isLoading}
        >
          {isCurrentDelegate ? "Undelegate" : "Delegate"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DelegateCard({
  delegate,
  isCurrentDelegate,
  onSelect,
}: {
  delegate: DelegateInfo;
  isCurrentDelegate: boolean;
  onSelect: () => void;
}) {
  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <AddressAvatar address={delegate.address} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">
              {delegate.name || formatAddress(delegate.address)}
            </h3>
            {isCurrentDelegate && <Badge variant="primary" size="sm">Your Delegate</Badge>}
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {formatNumber(delegate.votingPower, { compact: true })} vTON · {delegate.delegators} delegators
          </p>
          {delegate.statement && (
            <p className="text-sm text-[var(--text-secondary)] mt-2 truncate-2">
              {delegate.statement}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-1">
                <span>Vote Participation</span>
                <span>{delegate.voteParticipation}%</span>
              </div>
              <Progress value={delegate.voteParticipation} />
            </div>
            <Button size="sm" variant={isCurrentDelegate ? "secondary" : "primary"} onClick={onSelect}>
              {isCurrentDelegate ? "Manage" : "Delegate"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DelegatesPage() {
  const { useDelegates, useUserStatus } = useGovernance();
  const { data: delegates, isLoading } = useDelegates();
  const { data: userStatus } = useUserStatus();
  const [selectedDelegate, setSelectedDelegate] = useState<DelegateInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (delegate: DelegateInfo) => {
    setSelectedDelegate(delegate);
    setModalOpen(true);
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delegates</h1>
      </div>

      {/* Current delegation status */}
      {userStatus?.delegatedTo && (
        <Card variant="outlined" padding="sm">
          <div className="flex items-center gap-3">
            <AddressAvatar address={userStatus.delegatedTo} size="sm" />
            <div className="flex-1">
              <p className="text-sm text-[var(--text-secondary)]">
                Currently delegating {formatNumber(userStatus.delegatedAmount)} vTON to{" "}
                <span className="text-[var(--text-brand)] font-medium">
                  {formatAddress(userStatus.delegatedTo)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Delegate list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
          ))}
        </div>
      ) : delegates && delegates.length > 0 ? (
        <div className="space-y-4">
          {delegates.map((d) => (
            <DelegateCard
              key={d.address}
              delegate={d}
              isCurrentDelegate={userStatus?.delegatedTo?.toLowerCase() === d.address.toLowerCase()}
              onSelect={() => handleSelect(d)}
            />
          ))}
        </div>
      ) : (
        <Card padding="lg">
          <p className="text-center text-[var(--text-tertiary)]">No delegates found</p>
        </Card>
      )}

      <DelegationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        delegate={selectedDelegate}
      />
    </div>
  );
}
