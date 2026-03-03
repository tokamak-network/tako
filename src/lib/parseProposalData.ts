/**
 * Parses `proposal-data` code blocks from streaming text.
 * The agent emits these in MAKE_PROPOSAL mode.
 *
 * Format:
 * ```proposal-data
 * {
 *   "targets": ["0x..."],
 *   "functionBytecodes": ["0x..."],
 *   "decodedCalls": [{ "contract": "...", "function": "...", "args": {...} }]
 * }
 * ```
 */

export interface ProposalData {
  targets: string[];
  functionBytecodes: string[];
  decodedCalls: DecodedCall[];
  title?: string;
  description?: string;
}

export interface DecodedCall {
  contract: string;
  function: string;
  args: Record<string, string | number | boolean>;
}

const PROPOSAL_DATA_REGEX = /```proposal-data\s*\n([\s\S]*?)```/g;

export function parseProposalData(text: string): ProposalData | null {
  const matches = [...text.matchAll(PROPOSAL_DATA_REGEX)];
  if (matches.length === 0) return null;

  // Use the last match (most recent / complete)
  const lastMatch = matches[matches.length - 1];
  const jsonStr = lastMatch[1].trim();

  try {
    const data = JSON.parse(jsonStr);
    return {
      targets: data.targets ?? [],
      functionBytecodes: data.functionBytecodes ?? [],
      decodedCalls: data.decodedCalls ?? [],
      title: data.title,
      description: data.description,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if text contains a partial (incomplete) proposal-data block.
 * Useful for showing a "generating..." indicator.
 */
export function hasPartialProposalData(text: string): boolean {
  return text.includes("```proposal-data") && !text.includes("```proposal-data\n") === false;
}

/**
 * Parses `agenda-draft` code blocks from FORUM_PROPOSAL mode.
 */
export interface AgendaDraft {
  title?: string;
  abstract?: string;
  motivation?: string;
  specification?: string;
  rationale?: string;
  securityConsiderations?: string;
  expectedOutcomes?: string;
}

const AGENDA_DRAFT_REGEX = /```agenda-draft\s*\n([\s\S]*?)```/g;

export function parseAgendaDraft(text: string): AgendaDraft | null {
  const matches = [...text.matchAll(AGENDA_DRAFT_REGEX)];
  if (matches.length === 0) return null;

  const lastMatch = matches[matches.length - 1];
  const jsonStr = lastMatch[1].trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Extracts `question` code blocks from agent responses.
 */
export interface AgentQuestion {
  question: string;
  options?: string[];
}

const QUESTION_REGEX = /```question\s*\n([\s\S]*?)```/g;

export function parseQuestions(text: string): AgentQuestion[] {
  const matches = [...text.matchAll(QUESTION_REGEX)];
  return matches.map((m) => {
    try {
      return JSON.parse(m[1].trim());
    } catch {
      return { question: m[1].trim() };
    }
  });
}
