"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProposalData } from "@/lib/parseProposalData";
import { formatAddress } from "@/lib/utils";

export function ProposalPreviewPanel({
  data,
  onApply,
}: {
  data: ProposalData | null;
  onApply?: (data: ProposalData) => void;
}) {
  if (!data) {
    return (
      <Card variant="outlined">
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-[var(--text-tertiary)]">
              Ask the AI to help you create a proposal.
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              Try: &ldquo;Change the seig rate to 10%&rdquo;
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Proposal Preview</CardTitle>
          <Badge variant="success" size="sm">AI Generated</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.title && (
            <div>
              <label className="text-xs text-[var(--text-tertiary)]">Title</label>
              <p className="text-sm font-medium text-[var(--text-primary)]">{data.title}</p>
            </div>
          )}

          {data.description && (
            <div>
              <label className="text-xs text-[var(--text-tertiary)]">Description</label>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{data.description}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-[var(--text-tertiary)]">
              Actions ({data.targets.length})
            </label>
            <div className="space-y-2 mt-1">
              {data.decodedCalls.map((call, i) => (
                <div key={i} className="bg-[var(--bg-secondary)] p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" size="sm">{i + 1}</Badge>
                    <span className="font-medium text-[var(--text-primary)]">{call.contract}</span>
                  </div>
                  <p className="text-sm text-[var(--text-brand)] font-mono mt-1">
                    {call.function}
                  </p>
                  {Object.entries(call.args).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(call.args).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-[var(--text-tertiary)]">{key}</span>
                          <span className="text-[var(--text-secondary)] font-mono">
                            {typeof val === "string" && val.startsWith("0x")
                              ? formatAddress(val)
                              : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {data.targets.length > 0 && (
            <div>
              <label className="text-xs text-[var(--text-tertiary)]">Calldata</label>
              {data.functionBytecodes.map((b, i) => (
                <div key={i} className="bg-[var(--bg-tertiary)] p-2 rounded text-xs font-mono text-[var(--text-secondary)] break-all mt-1">
                  {b.length > 66 ? `${b.slice(0, 66)}...` : b}
                </div>
              ))}
            </div>
          )}

          {onApply && (
            <Button onClick={() => onApply(data)} className="w-full">
              Apply to Form
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
