"use client";

import Link from "next/link";
import { CreateProposalForm } from "@/components/proposals/CreateProposalForm";

export default function CreateProposalPage() {
  return (
    <div className="space-y-[var(--space-6)]">
      <Link href="/proposals" className="text-sm text-[var(--text-brand)] hover:underline">
        &larr; Back to proposals
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Proposal</h1>

      <CreateProposalForm />
    </div>
  );
}
