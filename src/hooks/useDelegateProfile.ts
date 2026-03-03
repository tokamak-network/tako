"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DelegateProfile } from "../../shared/types";

async function fetchProfile(address: string): Promise<DelegateProfile | null> {
  const res = await fetch(`/api/delegate-profile?address=${address}`);
  if (!res.ok) return null;
  return res.json();
}

async function updateProfile(profile: DelegateProfile): Promise<DelegateProfile> {
  const res = await fetch("/api/delegate-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export function useDelegateProfile(address?: string) {
  return useQuery({
    queryKey: ["delegateProfile", address],
    queryFn: () => fetchProfile(address!),
    enabled: !!address,
    staleTime: 60_000,
  });
}

export function useUpdateDelegateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["delegateProfile", data.address], data);
    },
  });
}
