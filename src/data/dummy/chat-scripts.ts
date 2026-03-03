import type { Mood } from "@/providers/character/types";

interface ScriptResponse {
  text: string;
  mood: Mood;
}

const scripts: Record<string, ScriptResponse> = {
  // Governance basics
  proposal: {
    text: "A proposal is a formal suggestion to change something in the Tokamak Network. Anyone with enough vTON can create one. It goes through several stages: pending, active voting, and if it passes, it gets queued and eventually executed through the Timelock.",
    mood: "explain",
  },
  vote: {
    text: "You can vote For, Against, or Abstain on any active proposal. You need delegated vTON to vote. Your voting power equals the amount of vTON delegated to you. Make sure to vote before the voting period ends!",
    mood: "explain",
  },
  delegate: {
    text: "Delegation is mandatory in vTON governance. You must delegate your vTON to someone (including yourself!) to activate voting power. You can change your delegate at any time, and your tokens stay in your wallet.",
    mood: "explain",
  },
  vton: {
    text: "vTON is the governance token of Tokamak Network. It's separate from TON — vTON is only for governance voting, while TON is the economic token. The max supply is 100M vTON, with emissions that halve every epoch.",
    mood: "explain",
  },
  staking: {
    text: "Staking TON in the Tokamak Network earns you seigniorage rewards. The staking system is managed by SeigManager, which calculates and distributes rewards to Layer2 operators and their stakers.",
    mood: "explain",
  },
  // Platform specific
  quorum: {
    text: "The quorum for vTON governance is 4% of total delegated supply. This means at least 4% of all delegated vTON must participate in a vote for it to be valid. This ensures meaningful community engagement.",
    mood: "explain",
  },
  timelock: {
    text: "After a proposal succeeds, it enters the Timelock with a 7-day delay. This gives the community time to review and, if necessary, the Security Council can cancel dangerous proposals during this window.",
    mood: "explain",
  },
  security: {
    text: "The Security Council is a 3-member multisig (2/3 threshold) that can cancel proposals and pause the protocol in emergencies. It's a safety mechanism — they cannot create or execute proposals themselves.",
    mood: "thinking",
  },
  // Greetings and meta
  hello: {
    text: "Welcome to Tokamak DAO! I'm here to help you navigate governance. You can ask me about proposals, voting, delegation, or anything else about the Tokamak Network. What would you like to know?",
    mood: "welcome",
  },
  help: {
    text: "I can help you with:\n- Understanding proposals and their impact\n- How to vote and delegate\n- vTON tokenomics\n- Protocol parameters\n- Security Council operations\n\nJust ask me anything!",
    mood: "welcome",
  },
  thanks: {
    text: "You're welcome! Governance participation makes the network stronger. Keep voting and staying informed — every voice matters in Tokamak DAO!",
    mood: "excited",
  },
};

const KEYWORD_MAP: Record<string, string> = {
  proposal: "proposal",
  proposals: "proposal",
  "안건": "proposal",
  vote: "vote",
  voting: "vote",
  "투표": "vote",
  delegate: "delegate",
  delegation: "delegate",
  "위임": "delegate",
  vton: "vton",
  token: "vton",
  "토큰": "vton",
  staking: "staking",
  stake: "staking",
  "스테이킹": "staking",
  quorum: "quorum",
  "정족수": "quorum",
  timelock: "timelock",
  "타임락": "timelock",
  security: "security",
  council: "security",
  "보안": "security",
  hello: "hello",
  hi: "hello",
  "안녕": "hello",
  help: "help",
  "도움": "help",
  thanks: "thanks",
  "감사": "thanks",
};

const FALLBACK: ScriptResponse = {
  text: "That's a great question! In the full version, I'd connect to the AI agent to give you a detailed answer with on-chain verification. For now, try asking about proposals, voting, delegation, vTON, or the Security Council.",
  mood: "thinking",
};

export function matchScript(input: string): ScriptResponse {
  const lower = input.toLowerCase().trim();

  for (const [keyword, scriptKey] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      return scripts[scriptKey];
    }
  }

  return FALLBACK;
}

export { scripts, KEYWORD_MAP };
