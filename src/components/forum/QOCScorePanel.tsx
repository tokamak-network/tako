"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CRITERION_LABELS,
  VERDICT_COLORS,
  type QocAggregatedResult,
  type CriterionId,
} from "@/types/qoc";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "var(--color-success-500)" : score >= 40 ? "var(--color-warning-500)" : "var(--color-error)";

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--text-tertiary)]">{label}</span>
        <span className="text-[var(--text-secondary)] font-medium">{score}</span>
      </div>
      <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function QOCScorePanel({ result }: { result: QocAggregatedResult }) {
  const verdictColor = VERDICT_COLORS[result.verdict];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>QOC Evaluation</CardTitle>
          <Badge
            variant={result.verdict === "APPROVE" ? "success" : result.verdict === "REJECT" ? "error" : "warning"}
          >
            {result.verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hard Veto banner */}
          {result.hardVeto && (
            <div className="bg-[var(--status-error-bg)] text-[var(--status-error-fg)] p-3 rounded-lg text-sm font-medium">
              HARD VETO: Technical Safety score below 20. Immediate rejection.
            </div>
          )}

          {/* Final Score */}
          <div className="text-center py-3">
            <div className="text-3xl font-bold" style={{ color: verdictColor }}>
              {result.finalScore.toFixed(1)}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">
              Based on {result.contributingCriteria} criteria
            </div>
          </div>

          {/* Criteria Scores */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Criteria Scores
            </h4>
            {(Object.keys(CRITERION_LABELS) as CriterionId[]).map((id) => {
              const score = result.criterionScores[id];
              if (!score) return null;
              return <ScoreBar key={id} label={CRITERION_LABELS[id]} score={score.score} />;
            })}
          </div>

          {/* Lens Results */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Stakeholder Perspectives
            </h4>
            {result.lensResults.map((lens) => (
              <div key={lens.lensId} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">{lens.lensName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-secondary)]">{lens.weightedScore.toFixed(1)}</span>
                  <Badge
                    variant={lens.verdict === "APPROVE" ? "success" : lens.verdict === "REJECT" ? "error" : "outline"}
                    size="sm"
                  >
                    {lens.verdict}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
