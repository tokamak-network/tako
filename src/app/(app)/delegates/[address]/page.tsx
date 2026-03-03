"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useGovernance } from "@/providers/governance/GovernanceProvider";
import { useDelegateProfile } from "@/hooks/useDelegateProfile";
import { DelegateProfileView } from "@/components/delegates/DelegateProfile";

export default function DelegateDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const { useDelegateInfo } = useGovernance();
  const { data: delegate, isLoading } = useDelegateInfo(address);
  const { data: profile } = useDelegateProfile(address);

  if (isLoading || !delegate) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse-soft" />
        <div className="h-64 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <Link href="/delegates" className="text-sm text-[var(--text-brand)] hover:underline">
        &larr; Back to delegates
      </Link>
      <DelegateProfileView delegate={delegate} profile={profile} />
    </div>
  );
}
