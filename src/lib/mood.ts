/**
 * AI response → character mood mapping.
 *
 * Simple keyword heuristic for MVP.
 * Used by ChatWindow to auto-sync mood during AI dialogue,
 * and by CharacterProvider for external callers.
 */

import type { Mood } from "@/providers/character/types";

const EXPLAIN_PATTERNS =
  /warning|risk|danger|caution|against|defeat|reject|fail|error|vulnerab|exploit|attack|careful|concern|issue|problem/i;

const EXCITED_PATTERNS =
  /success|complete|passed|approved|executed|great|excellent|congratulat|ready|safe|done!|perfect|awesome/i;

const THINKING_PATTERNS =
  /loading|analyzing|processing|thinking|wait|checking|simulating|decoding|fetching/i;

/**
 * Infer character mood from AI response content.
 *
 * Priority: thinking > explain > excited > welcome (default)
 * - thinking: response mentions analysis/processing (usually mid-stream)
 * - explain: warnings, risks, errors
 * - excited: success, approval, completion
 * - welcome: everything else
 */
export function inferMood(content: string): Mood {
  if (!content) return "welcome";

  if (THINKING_PATTERNS.test(content)) return "thinking";
  if (EXPLAIN_PATTERNS.test(content)) return "explain";
  if (EXCITED_PATTERNS.test(content)) return "excited";

  return "welcome";
}
