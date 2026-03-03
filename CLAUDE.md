# Tokamak DAO — Character-Driven Governance Platform

## Mission

> 캐릭터 기반 UI/UX로 사용자가 DAO에 자연스럽게 참여하도록 유도하고,
> 전문 지식이 필요한 참여 과정은 LLM(Agent)로 보완한다.

### Decision Criteria

- "이 변경이 DAO 참여의 진입장벽을 낮추는가?"
- "전문 지식 없는 사용자가 이해할 수 있는 형태인가?"
- "캐릭터와 AI가 적절히 역할을 나누고 있는가?"

---

## Session Start Protocol

**Every agent MUST do this at the start of every session:**

```
1. Read PLAN.md     → 전체 작업 목록과 우선순위 파악
2. Read PROGRESS.md → 현재까지 완료된 작업과 진행 상황 파악
3. Diff (PLAN - PROGRESS) → 내가 해야 할 다음 작업 결정
4. 작업 시작 전 PROGRESS.md에 "작업 시작" 기록
5. 작업 완료 후 PROGRESS.md에 결과 기록
```

### PLAN.md — 무엇을 해야 하는가

전체 작업 계획. 사용자가 정의하고, 에이전트가 참조한다.

```markdown
# Plan

## Phase 1: Project Setup
- [ ] P1-1. Next.js 15 프로젝트 초기화
- [ ] P1-2. dao-v2 디자인 시스템 이식
- [ ] P1-3. wagmi + viem 설정

## Phase 2: Governance Core
- [ ] P2-1. 안건 목록 페이지
- [ ] P2-2. 안건 상세 + 투표
- [ ] P2-3. 위임 UI
...
```

Rules:
- 작업 ID 형식: `P{phase}-{number}` (예: P1-1, P2-3)
- 체크박스로 완료 상태 추적 (`- [ ]` / `- [x]`)
- 의존성이 있으면 작업 설명에 명시 (예: "P2-1 완료 후 진행")
- 사용자만 새 Phase를 추가하거나 작업을 삭제할 수 있음
- 에이전트는 작업 분해(subtask)를 PROGRESS.md에 기록

### PROGRESS.md — 어디까지 했는가

작업 진행 기록. 에이전트가 작성하고, 다음 에이전트가 읽는다.

```markdown
# Progress

## Current Status
- **Last updated**: 2026-03-03
- **Current phase**: Phase 1 - Project Setup
- **Next task**: P1-2 (dao-v2 디자인 시스템 이식)
- **Blockers**: None

## Completed
### P1-1. Next.js 15 프로젝트 초기화 ✅
- **Date**: 2026-03-03
- **What was done**: create-next-app으로 초기화, TypeScript + Tailwind v4 설정
- **Key decisions**: App Router 사용, src/ 디렉터리 구조
- **Files created/modified**: package.json, tsconfig.json, tailwind.config.ts
- **Verification**: npm run dev 정상 동작 확인

## In Progress
(현재 진행 중인 작업 — 에이전트가 시작 시 기록, 완료 시 Completed로 이동)

## Blocked
(차단된 작업과 사유)
```

Rules:
- **Current Status** 섹션을 항상 최신으로 유지 — 다음 에이전트가 이것만 읽어도 상황 파악 가능
- 작업 시작 시: In Progress에 작업 ID + 시작 시각 기록
- 작업 완료 시: Completed로 이동, 결과 요약 작성
- 작업 차단 시: Blocked로 이동, 사유와 해결 방안 기록
- **Key decisions**: 구현 중 내린 판단은 반드시 기록 (다음 에이전트가 "왜 이렇게 했지?" 하지 않도록)
- **Files created/modified**: 변경 파일 목록 기록 (다음 에이전트가 어디를 봐야 하는지 즉시 파악)

### Multi-Agent Coordination

여러 에이전트가 동시에 작업할 때:
- 각 에이전트는 PROGRESS.md의 In Progress를 확인하여 **다른 에이전트가 작업 중인 항목을 피한다**
- 작업 시작 시 In Progress에 자신의 작업을 기록하여 충돌 방지
- 같은 파일을 수정하는 작업은 동시에 진행하지 않는다
- 의존성 있는 작업(예: P2-1이 P1-3에 의존)은 선행 작업이 Completed에 있어야 시작

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js 15)               │
│                                                  │
│  Character Layer     Governance UI    AI Chat    │
│  (from toki)         (from dao-v2)    Interface  │
│  - mood images       - proposals      - SSE      │
│  - typewriter        - voting         streaming  │
│  - quest engine      - delegation     - tool     │
│  - achievements      - dashboard      results    │
│                                                  │
│              wagmi + viem (on-chain)              │
└──────────────────┬───────────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼───┐  ┌─────▼─────┐  ┌───▼──────┐
│Ethereum│  │DAO Agent  │  │Supabase  │
│Contracts│ │Server     │  │(profiles)│
│(v1+v2) │  │(Hono/Bun) │  │          │
└────────┘  └───────────┘  └──────────┘
```

### Source Projects

| Project | Path | Role | What We Use |
|---------|------|------|-------------|
| toki | `~/workspace/toki` | Character UX | Mood system, typewriter, quest engine, achievements |
| tokamak-dao-v2 | `~/workspace/tokamak-dao-v2` | Governance core | Contracts (spec 1.3), hooks, UI components, design system |
| tokamak-dao-agent | `~/workspace/tokamak-dao-agent` | AI agent | MCP tools, chat API, analysis modes, QOC evaluation |

### Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS v4
- **UI Components**: CVA (class-variance-authority) + Radix UI (from dao-v2)
- **Wallet**: Wagmi 2.x + Reown AppKit
- **On-chain**: viem
- **State**: TanStack React Query
- **AI Server**: Hono + Bun (dao-agent, independent service)
- **Contracts**: Foundry/Forge (Solidity)
- **DB**: Supabase (delegate profiles) + SQLite (forum/QOC in agent server)

---

## Governance: V1 and V2

This project operates during the **v1→v2 transition period**. Both systems coexist until migration completes.

### V1 — Current Mainnet (DAOCommittee)

```
Proposer (100 TON fee) → Notice (16d) → Committee Vote (2d, 3명 중 2명) → Execution (7d)
```

- **Governance token**: TON (economic + governance dual-purpose)
- **Voters**: 3 committee members only (staking-based seat competition)
- **Executor**: DAOCommitteeProxy (0xDD9f0cCc044B0781289Ee318e5971b0139602C26)
- **Quorum**: 2/3 committee members
- **Historical agendas**: 16 executed on mainnet
- **Controlled contracts**: 47+ (SeigManager, DepositManager, Layer2Registry, etc.)

Key V1 contracts:
```
DAOCommitteeProxy     0xDD9f0cCc044B0781289Ee318e5971b0139602C26
DAOAgendaManager      0xcD4421d082752f363E1687544a09d67B978497a0
DAOVault              0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303
SeigManagerProxy      0x0b55a0f463b6defb81c6063973763951712d0e5f
DepositManagerProxy   0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e
TON                   0x2be5e8c109e2197D077D13A82dAead6a9b3433C5
WTON                  0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2
Layer2Registry        0x0b3E174A2170083e770D5d4Cf56774D221b7063e
```

### V2 — New System (DAOGovernor, spec 1.3)

```
RFC (7d) → Snapshot (5d) → Review (3d) → On-chain Vote (7d) → Timelock (7d) → Execution
```

- **Governance token**: vTON (governance-only, separate from TON)
- **Voters**: Anyone with delegated vTON (mandatory delegation)
- **Executor**: Timelock → anyone can trigger after delay
- **Security Council**: 3 members (2/3 threshold), can cancel proposals and pause protocol
- **Quorum**: 4% of total delegated vTON
- **Pass rate**: >50% (simple majority)

Key V2 parameters:
```
vTON max supply          100,000,000
Epoch size               5,000,000 (halving: 25% decay per epoch)
Proposal threshold       0.25% of total vTON supply
Proposal creation cost   10 TON (burned)
Voting delay             7,200 blocks (~1 day)
Voting period            50,400 blocks (~7 days)
Timelock delay           7 days (min 1d, max 30d)
Grace period             14 days
```

V2 contracts (Sepolia deployed, mainnet pending):
```
vTON                  (governance token, ERC20 + ERC20Votes)
DAOGovernor           (proposals, voting, parameter management)
DelegateRegistry      (mandatory delegation, public profiles)
Timelock              (execution delay, queue/execute/cancel)
SecurityCouncil       (emergency response, 2/3 multisig)
```

### V1→V2 Migration

**Migration is executed through v1 agendas.** DAOCommitteeProxy has arbitrary execution capability and transfers admin rights to v2 Timelock contract-by-contract.

Migration phases:
```
Phase 1 (Pre-migration):  v2 contracts deployed, v1 holds all authority
Phase 2 (Dual-operation): v1 agendas transfer authority one contract at a time
Phase 3 (Complete):       All authority with v2 Timelock, v1 becomes historical
```

**Authority Map** (`knowledge/authority-map.json`):
- Single source of truth for "who controls what right now"
- Updated after each migration agenda executes
- AI agent references this to answer "where do I vote for this?"

---

## Character System (from toki)

### Mood States

| Mood | Use Case | Color |
|------|----------|-------|
| welcome | Greeting, general | Blue |
| explain | Teaching, describing | Cyan |
| thinking | Processing, analyzing | Indigo |
| excited | Success, positive results | Amber |

(MVP uses 4 moods. Full set has 7: +proud, cheer, wink)

### Two Dialogue Modes

**Static dialogue** — Predictable flows (onboarding, tutorials):
```
Keyword-matching dialogue tree (from toki's toki-dialogue.ts pattern)
Node structure: { id, mood, text, choices[], autoNext? }
Used for: quests, FAQ, guided walkthroughs
```

**AI dialogue** — Real-time intelligent responses (governance):
```
SSE streaming to dao-agent /api/chat endpoint
Agent modes: CHAT (general), ANALYZE_PROPOSAL (proposal explanation)
Character wraps AI responses with mood + typewriter effect
```

### Mood-Response Mapping (AI dialogue)

```typescript
// Simple heuristic for MVP — match AI response content to character mood
function inferMood(content: string): Mood {
  if (analyzing/loading)     return 'thinking'
  if (warning/risk)          return 'explain'
  if (safe/success/complete) return 'excited'
  return 'welcome' // default
}
```

### Quest Engine (from toki)

Phase structure per quest: `intro → action → verifying → success → badge + XP`

MVP quests (governance-focused):
```
Q1. Connect wallet          (100 XP)
Q2. Get vTON                (200 XP)
Q3. Self-delegate            (300 XP)
Q4. Cast first vote          (500 XP)
```

---

## AI Agent (from tokamak-dao-agent)

### Server

- **Runtime**: Bun + Hono
- **Chat endpoint**: `POST /api/chat` (SSE streaming)
- **Port**: 3333 (API), 3001 (MCP SSE)

### System Prompt Modes

| Mode | Purpose | Trigger |
|------|---------|---------|
| CHAT | General governance Q&A | Default conversation |
| ANALYZE_PROPOSAL | Decode and assess proposal safety | User views proposal detail |
| MAKE_PROPOSAL | Guide proposal creation step-by-step | User starts proposal creation (post-MVP) |
| FORUM_PROPOSAL | RFC-template proposal drafting | Forum integration (post-MVP) |

### MCP Tools (15 total, MVP uses 4)

**MVP tools (essential):**
```
get_contract_info       Search contracts by name/address, proxy relationships
query_on_chain          Call view/pure functions, get current on-chain values
decode_calldata         Decode proposal calldata into human-readable format
simulate_transaction    eth_call simulation, predict execution outcome
```

**Post-MVP tools:**
```
read_contract_source    Read Solidity source code
search_contract_code    Full-text search across contract files
read_storage_slot       Raw storage slot reading with decoding
read_contract_state     Full state decoding via storage layouts
encode_calldata         Encode function calls into proposal calldata
test_token_transfer     DEX compatibility testing
run_fork_test           Foundry fork test execution
list_dao_actions        Discover all DAO-callable contracts/functions
check_upgrade_path      Verify proxy upgrade capability
analyze_agenda          Comprehensive proposal analysis pipeline
web_fetch               External DeFi API queries
```

### Rule: Verification Before Answering

Inherited from dao-agent. When the AI answers questions about on-chain behavior:

| Question Pattern | Required Tool |
|-----------|----------|
| "What does this proposal do?" | `decode_calldata` → `simulate_transaction` |
| "Is this safe?" | `simulate_transaction` + current vs proposed values |
| "What's the current value of X?" | `query_on_chain` |
| "Who controls this contract?" | `get_contract_info` + authority-map lookup |

Never speculate about contract behavior. Always verify with on-chain data first.

---

## MVP Scope

### What's In

```
3 pages:
  /dashboard            My vTON, delegation status, active proposals summary
  /proposals            Proposal list + detail + voting + character explanation
  /delegates            Delegate list + delegate/undelegate

Character:
  ChatBubble + ChatWindow (floating, typewriter, 4 moods)
  AI-powered responses for governance questions
  Static dialogue for basic onboarding

Governance:
  View proposals (list + detail with decoded calldata)
  Cast vote (For/Against/Abstain with VotingModal)
  Delegate/undelegate vTON (DelegationModal)
  Dashboard metrics (total supply, active proposals, top delegates)

AI integration:
  SSE streaming from dao-agent /api/chat
  4 MCP tools (get_contract_info, query_on_chain, decode_calldata, simulate_transaction)
  CHAT + ANALYZE_PROPOSAL modes
```

### What's Not In (Post-MVP)

```
Quest system, achievement cards, XP/leveling
Proposal creation (MAKE_PROPOSAL mode)
QOC evaluation visualization (7-criterion scoring)
Forum, deliberation, comments
Security Council UI
Visual novel cinematic
ElizaOS autonomous agents
Multi-language (i18n)
Dark/light theme toggle
Gasless transactions (EIP-7702 + TON Paymaster)
```

---

## Project Structure

```
shared/                            # ⚠️ Single Source of Truth — 수동 편집 금지
├── abi/                           # forge build에서 자동 추출
│   ├── DAOGovernor.json
│   ├── DelegateRegistry.json
│   ├── vTON.json
│   ├── Timelock.json
│   └── SecurityCouncil.json
├── types.ts                       # ABI에서 자동 생성 (Proposal, VoteType, ProposalState)
├── enums.ts                       # 사람이 읽을 수 있는 label 매핑
├── addresses.ts                   # 배포 결과에서 자동 생성 (chain별)
└── agent-types.ts                 # Agent SSE 프로토콜 타입

src/
├── app/                           # Next.js pages (App Router)
│   ├── (app)/                     # Protected routes group
│   │   ├── dashboard/
│   │   ├── proposals/
│   │   │   └── [id]/
│   │   └── delegates/
│   │       └── [address]/
│   ├── layout.tsx
│   └── page.tsx                   # Landing
│
├── components/
│   ├── ui/                        # Design system (from dao-v2, CVA-based)
│   ├── character/                 # Character system (from toki)
│   │   ├── ChatBubble.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── Typewriter.tsx
│   │   └── MoodImage.tsx
│   ├── proposals/                 # Governance UI (from dao-v2)
│   ├── delegates/
│   └── dashboard/
│
├── hooks/
│   ├── contracts/                 # On-chain hooks — import from shared/
│   │   ├── useDAOGovernor.ts
│   │   ├── useDelegateRegistry.ts
│   │   └── useVTON.ts
│   └── useAgentChat.ts            # SSE client — import from shared/agent-types
│
├── lib/
│   ├── dialogue.ts                # Static dialogue tree (from toki pattern)
│   └── mood.ts                    # AI response → mood mapping
│
├── config/
│   └── wagmi.ts                   # import addresses from shared/
│
└── providers/
    ├── Web3Provider.tsx
    └── CharacterProvider.tsx

contracts/                         # Foundry project (v2 spec 1.3)
├── src/                           # Solidity sources
├── out/                           # Build artifacts → /sync 로 shared/abi/에 복사
├── script/                        # Deployment scripts
└── test/

scripts/                           # 자동화 스크립트
├── sync-abi.ts                    # contracts/out/ → shared/abi/
├── generate-types.ts              # shared/abi/ → shared/types.ts + enums.ts
├── sync-addresses.ts              # deploy logs → shared/addresses.ts
└── validate-consistency.ts        # 세 축 일관성 검증

knowledge/                         # Governance knowledge base
├── authority-map.json             # Contract authority tracking (v1/v2)
├── v1/                            # V1 contract sources and registry
└── v2/                            # V2 contract sources and registry
```

---

## Development Rules

### 1. PLAN.md / PROGRESS.md First

- 작업 시작 전 반드시 PLAN.md와 PROGRESS.md를 읽는다.
- PLAN.md에 없는 작업은 하지 않는다. 필요하다고 판단되면 사용자에게 먼저 제안한다.
- 작업 시작/완료/차단 시 PROGRESS.md를 즉시 업데이트한다.
- Non-trivial task (3+ steps)는 plan mode를 사용한다.
- If something fails, STOP and re-plan — don't keep pushing.

### 2. Component Reuse

1. Check `src/components/ui/` first (CVA-based design system from dao-v2)
2. Check source projects for existing implementations before writing new code
3. When porting from source projects, adapt to this project's patterns — don't copy blindly

### 3. Character-AI Boundary

- **Static dialogue**: Predictable, no network calls. Use for onboarding, tutorials, FAQ.
- **AI dialogue**: Requires dao-agent server. Use for proposal analysis, governance questions.
- Never fake AI responses with static text for governance-critical information.
- Always show loading state (thinking mood) while waiting for AI response.

### 4. shared/ Layer — Single Source of Truth

- **shared/ 의 파일은 수동으로 편집하지 않는다.** 항상 `/sync` 커맨드를 통해 생성한다.
- ABI, 타입, enum, 주소를 src/ 에서 직접 정의하지 않는다. 반드시 shared/ 에서 import.
- 컨트랙트를 변경한 후에는 반드시 `/sync contracts` 실행.
- 배포 후에는 반드시 `/sync deploy` 실행.
- VoteType과 ProposalState enum 값을 하드코딩하면 안 된다 — shared/enums.ts 사용.

### 5. On-Chain Data

- Never display raw calldata without AI-decoded explanation alongside
- Always show "current value → proposed value" when displaying parameter changes
- Contract hooks from dao-v2 are the canonical way to interact with contracts

### 6. Migration Awareness

- Before implementing any governance feature, check: does this apply to v1, v2, or both?
- The authority-map.json determines which system governs each contract
- UI must clearly indicate which governance system a proposal belongs to
- AI agent must reference authority-map when answering "where do I vote?"

### 7. Verification Before Done

- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask: "Would a staff engineer approve this?"
- 컨트랙트/타입/주소 변경 후에는 `/sync validate` 로 일관성 검증.

### 8. Self-Improvement

After ANY correction from the user:
- Update `tasks/lessons.md` with the mistake pattern and prevention rule.
- If the correction affects future work, update PROGRESS.md의 relevant task entry with a note.

---

## Slash Commands

| Command | Usage | Purpose |
|---------|-------|---------|
| `/start` | `/start` | 세션 시작 — PLAN.md + PROGRESS.md 읽고 다음 작업 결정 |
| `/progress` | `/progress start P1-2` | 작업 시작/완료/차단 기록 |
| `/progress` | `/progress done P1-2` | 작업 완료 기록 (Key decisions, Files 필수) |
| `/progress` | `/progress block P1-2 "reason"` | 작업 차단 기록 |
| `/authority` | `/authority SeigManager` | 컨트랙트 관리 주체(v1/v2) 조회 |
| `/port` | `/port dao-v2 ui` | 소스 프로젝트에서 코드 이식 |
| `/sync` | `/sync contracts` | 컨트랙트 빌드 → shared/ 동기화 |
| `/sync` | `/sync deploy` | 배포 주소 → shared/addresses.ts 동기화 |
| `/sync` | `/sync validate` | 세 축 일관성 검증 |

## Skills

| Skill | Auto-invoke | Purpose |
|-------|-------------|---------|
| `check-governance` | Yes | 거버넌스 코드 작성 시 v1/v2 적용 범위 자동 판단 |
| `cross-axis-check` | Yes | shared/, contracts/, hooks 변경 시 다른 축 영향도 자동 확인 |

## Shell Commands

```bash
# Frontend
npm run dev              # Dev server
npm run build            # Production build
npm run lint             # ESLint

# Contracts (in contracts/ directory)
cd contracts && forge build    # Build contracts
cd contracts && forge test     # Run tests

# DAO Agent (separate service, ~/workspace/tokamak-dao-agent)
cd ~/workspace/tokamak-dao-agent && bun run src/web/server.ts    # Start agent server
```

---

## Key References

| What | Where |
|------|-------|
| V2 governance spec | `~/workspace/tokamak-dao-v2/docs/specs/0.1.3/spec.md` |
| V2 contract interfaces | `~/workspace/tokamak-dao-v2/contracts/contract-spec.md` |
| V2 protocol parameters | `~/workspace/tokamak-dao-v2/docs/protocol-parameters.md` |
| V1 contract topology | `~/workspace/tokamak-dao-agent/docs/contract-map.md` |
| V1 contract registry | `~/workspace/tokamak-dao-agent/scripts/mainnet/contracts.json` |
| V1 historical agendas | `~/workspace/tokamak-dao-agent/scripts/mainnet/agendas.json` |
| Agent system prompts | `~/workspace/tokamak-dao-agent/src/web/system-prompt.ts` |
| Agent MCP tools | `~/workspace/tokamak-dao-agent/src/mcp/tools/handlers.ts` |
| Toki character dialogue | `~/workspace/toki/src/lib/toki-dialogue.ts` |
| Toki quest engine | `~/workspace/toki/src/components/onboarding/OnboardingQuest.tsx` |
| Toki chat component | `~/workspace/toki/src/components/chat/TokiChat.tsx` |
| Toki achievement system | `~/workspace/toki/src/lib/achievements.ts` |
| Security Council research | `~/workspace/tokamak-dao-v2/docs/research/security-council-intervention-models.md` |
