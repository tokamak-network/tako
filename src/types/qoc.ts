/**
 * QOC (Quality of Contribution) types.
 * Matches dao-agent QOC evaluation system.
 */

export type CriterionId =
  | "techSafety"
  | "econImpact"
  | "govIntegrity"
  | "opsContinuity"
  | "stratAlign"
  | "reversibility"
  | "implQuality";

export type QocVerdict = "APPROVE" | "NEEDS_REVIEW" | "ABSTAIN" | "REJECT";

export interface QocCriterionScore {
  score: number; // 0-100
  evidence: string;
}

export interface QocLensResult {
  lensId: string;
  lensName: string;
  weightedScore: number;
  verdict: QocVerdict;
}

export interface QocAggregatedResult {
  agendaId: number;
  criterionScores: Record<CriterionId, QocCriterionScore>;
  lensResults: QocLensResult[];
  finalScore: number;
  verdict: QocVerdict;
  hardVeto: boolean;
  avgTechSafety: number;
  contributingCriteria: number;
  createdAt: string;
}

export const CRITERION_LABELS: Record<CriterionId, string> = {
  techSafety: "Technical Safety",
  econImpact: "Economic Impact",
  govIntegrity: "Governance Integrity",
  opsContinuity: "Operations Continuity",
  stratAlign: "Strategic Alignment",
  reversibility: "Reversibility",
  implQuality: "Implementation Quality",
};

export const VERDICT_COLORS: Record<QocVerdict, string> = {
  APPROVE: "var(--color-success-500)",
  NEEDS_REVIEW: "var(--color-warning-500)",
  ABSTAIN: "var(--text-tertiary)",
  REJECT: "var(--color-error)",
};
