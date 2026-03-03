"use client";

import { useState } from "react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegisterDelegate } from "@/hooks/contracts";

export function DelegateRegistrationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [philosophy, setPhilosophy] = useState("");

  const { register, isLoading, isConfirmed, reset } = useRegisterDelegate();

  const handleSubmit = () => {
    if (!name.trim() || !about.trim() || !philosophy.trim()) return;
    register(name, philosophy, about);
  };

  const handleClose = () => {
    reset();
    setName("");
    setAbout("");
    setPhilosophy("");
    onClose();
  };

  if (isConfirmed) {
    return (
      <Modal open={open} onClose={handleClose} title="Registration Complete" size="sm">
        <ModalBody>
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-[var(--text-primary)] font-semibold">
              You are now a registered delegate!
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              Others can now delegate their vTON to you.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Become a Delegate" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">About Me *</label>
            <Textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Voting Philosophy *</label>
            <Textarea
              value={philosophy}
              onChange={(e) => setPhilosophy(e.target.value)}
              placeholder="How will you evaluate proposals?"
              rows={3}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || !about.trim() || !philosophy.trim()}
          loading={isLoading}
        >
          Register as Delegate
        </Button>
      </ModalFooter>
    </Modal>
  );
}
