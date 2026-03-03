"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAgenda } from "@/lib/forum-client";

export default function ForumCreatePage() {
  const router = useRouter();
  const { address } = useAccount();

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [motivation, setMotivation] = useState("");
  const [specification, setSpecification] = useState("");
  const [rationale, setRationale] = useState("");
  const [security, setSecurity] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim() && abstract.trim() && address;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await createAgenda({
        title,
        abstract,
        motivation,
        specification,
        rationale,
        securityConsiderations: security,
        expectedOutcomes: outcomes,
        author: address,
      });
      router.push("/forum");
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { label: "Title *", value: title, onChange: setTitle, type: "input" as const },
    { label: "Abstract *", value: abstract, onChange: setAbstract, type: "textarea" as const, placeholder: "Brief summary of the proposal" },
    { label: "Motivation", value: motivation, onChange: setMotivation, type: "textarea" as const, placeholder: "Why is this change needed?" },
    { label: "Specification", value: specification, onChange: setSpecification, type: "textarea" as const, placeholder: "Technical details and parameters" },
    { label: "Rationale", value: rationale, onChange: setRationale, type: "textarea" as const, placeholder: "Why this approach over alternatives?" },
    { label: "Security Considerations", value: security, onChange: setSecurity, type: "textarea" as const, placeholder: "Risks and mitigations" },
    { label: "Expected Outcomes", value: outcomes, onChange: setOutcomes, type: "textarea" as const, placeholder: "What will change if this passes?" },
  ];

  return (
    <div className="space-y-[var(--space-6)] max-w-2xl">
      <Link href="/forum" className="text-sm text-[var(--text-brand)] hover:underline">
        &larr; Back to forum
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">New RFC</h1>

      <p className="text-sm text-[var(--text-tertiary)]">
        Use the AI chat assistant (bottom-right) to help draft your proposal. It will guide you through each section.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>RFC Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((s) => (
              <div key={s.label}>
                <label className="text-sm text-[var(--text-secondary)] mb-1 block">{s.label}</label>
                {s.type === "input" ? (
                  <Input value={s.value} onChange={(e) => s.onChange(e.target.value)} />
                ) : (
                  <Textarea
                    value={s.value}
                    onChange={(e) => s.onChange(e.target.value)}
                    placeholder={s.placeholder}
                    rows={4}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => router.push("/forum")}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>
          Submit RFC
        </Button>
      </div>
    </div>
  );
}
