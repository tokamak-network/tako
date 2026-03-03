# Progress

## Current Status
- **Last updated**: 2026-03-03
- **Current phase**: Phase A complete — UI with dummy data fully functional
- **Next task**: Phase B (P1-4 wagmi + viem, P2-1 contract hooks)
- **Blockers**: None

## Completed

### Project Planning ✅
- **Date**: 2026-03-03
- **What was done**: CLAUDE.md 작성 — 프로젝트 미션, 아키텍처, v1/v2 거버넌스 모델, 캐릭터 시스템, AI 에이전트 도구, MVP 범위, 개발 규칙 정의
- **Key decisions**:
  - dao-v2를 프론트엔드 기반으로 채택 (Next.js 15, Tailwind v4, CVA)
  - dao-agent는 독립 서비스로 유지 (Hono/Bun)
  - MVP 도구 4개 선정 (get_contract_info, query_on_chain, decode_calldata, simulate_transaction)
  - 캐릭터 mood 4종으로 시작 (welcome, explain, thinking, excited)
  - 정적 대화 + AI 대화 이중 구조
- **Files created/modified**: CLAUDE.md, PLAN.md, PROGRESS.md

### P1-1. Next.js 15 프로젝트 초기화 ✅
- **Date**: 2026-03-03
- **What was done**: create-next-app으로 Next.js 16/React 19 프로젝트 생성, 핵심 패키지 설치 (cva, clsx, tailwind-merge, radix-ui/react-slot), lib/utils.ts 생성
- **Key decisions**:
  - TypeScript strict mode, App Router, src/ 디렉터리 구조
  - Tailwind CSS v4 사용 (postcss 기반)
  - 다크 테마 기본 적용 (html className="dark")
- **Files created/modified**: package.json, tsconfig.json, src/lib/utils.ts (cn, formatAddress, formatNumber, formatDate, formatVTON, formatBasisPoints, formatPercentage18, formatDuration, truncateMiddle)
- **Verification**: npm run build 성공

### P1-2. shared/ 타입 + Provider 인터페이스 + 더미 데이터 + Provider 구현 ✅
- **Date**: 2026-03-03
- **What was done**:
  - shared/types.ts — ProposalStatus, ProposalState, VoteType enums, Proposal, ProposalListItem, DelegateInfo, UserStatus, DAOParameters, DashboardMetrics 등
  - shared/agent-types.ts — AgentMode, ChatSSEEvent, ChatMessage, MessagePart, ToolCall
  - Provider 인터페이스: GovernanceDataProvider, ChatContextValue, CharacterContextValue
  - 더미 데이터: 6개 proposals (각 status별), 5개 delegates, user status, DAO parameters, 키워드 매칭 chat scripts
  - Provider 구현: GovernanceProvider (더미 쿼리 + 로컬 state 업데이트), ChatProvider (키워드 매칭 + 단어별 스트리밍), CharacterProvider (mood 관리)
- **Key decisions**:
  - proposal ID를 string으로 통일 (bigint 직렬화 문제 방지)
  - GovernanceDataProvider 인터페이스에서 useDelegate (read) → useDelegateInfo, useDelegate (write) → useDelegation으로 이름 충돌 해결
  - 더미 Provider는 useDummyQuery 헬퍼로 시뮬레이션 딜레이 구현 (400-800ms)
  - 채팅은 단어 단위 50ms 간격 스트리밍으로 SSE 시뮬레이션
- **Files created/modified**:
  - shared/types.ts, shared/agent-types.ts
  - src/providers/governance/types.ts, GovernanceProvider.tsx
  - src/providers/chat/types.ts, ChatProvider.tsx
  - src/providers/character/types.ts, CharacterProvider.tsx
  - src/data/dummy/proposals.ts, delegates.ts, user.ts, parameters.ts, chat-scripts.ts

### P1-3. 디자인 시스템 이식 ✅
- **Date**: 2026-03-03
- **What was done**:
  - design-tokens.css — dao-v2에서 3-layer 토큰 시스템 이식 (primitive → semantic → component)
  - globals.css — Tailwind v4 테마 설정 + typography + scrollbar + animations + proposal prose
  - toki 전용 애니메이션 추가: float, glow-pulse, drop-in, slide-up-fade
  - UI 컴포넌트 8종 이식: Button, Card, Badge/StatusBadge, Input/Textarea, Progress/VotingProgress, Modal/ModalBody/ModalFooter, Avatar/AddressAvatar, StatCard, Navigation
- **Key decisions**:
  - dao-v2 CVA 패턴 그대로 유지
  - 모든 색상/간격은 CSS 변수 참조 (하드코딩 없음)
  - dark 테마 기본 적용
- **Files created/modified**:
  - src/styles/design-tokens.css (dao-v2에서 복사)
  - src/app/globals.css (dao-v2 + toki 애니메이션 병합)
  - src/components/ui/ (button, card, badge, input, progress, modal, avatar, stat-card, navigation, index.ts)

### P3-1/P3-2. 캐릭터 컴포넌트 ✅
- **Date**: 2026-03-03
- **What was done**:
  - mood 이미지 4종 (welcome, explain, thinking, excited) + icon을 toki에서 public/character/로 복사
  - MoodImage — mood별 이미지 + glow 효과
  - Typewriter — useTypewriter hook (25ms/char) + 블링크 커서
  - ChatBubble — 우하단 플로팅 버블, ping 애니메이션
  - ChatWindow — 캐릭터 헤더 + 메시지 목록 + 입력창, Provider에서 데이터 수신
- **Key decisions**:
  - Typewriter를 hook으로 구현 (useTypewriter) — 재사용 가능
  - ChatWindow는 useChat() + useCharacter()만 사용, 데이터 출처 무관
  - glow 효과는 CSS blur + opacity 애니메이션
- **Files created/modified**:
  - public/character/ (5개 이미지)
  - src/components/character/MoodImage.tsx, Typewriter.tsx, ChatBubble.tsx, ChatWindow.tsx

### P2-2~P2-5. 페이지 구현 ✅
- **Date**: 2026-03-03
- **What was done**:
  - 루트 레이아웃 (dark 테마, 메타데이터)
  - 앱 레이아웃 — CharacterProvider > GovernanceProvider > ChatProvider > Navigation + main + ChatBubble/ChatWindow
  - 랜딩 페이지 (/) — Enter App + View Proposals
  - 대시보드 (/dashboard) — MetricsGrid (6개 StatCard), ActiveProposals, TopDelegates, MyStatus
  - 안건 목록 (/proposals) — 필터 탭 (All/Active/Pending/Succeeded/Executed/Defeated), ProposalCard + VotingProgress
  - 안건 상세 (/proposals/[id]) — 마크다운 description, VotingProgress, VotingModal (For/Against/Abstain + 사유), Timeline, Quorum 표시
  - 위임 (/delegates) — DelegateCard (투표력, 프로필, 참여율), DelegationModal (위임/해제), 현재 위임 상태 표시
- **Key decisions**:
  - 모든 페이지는 useGovernance() hook만 사용 — 데이터 출처를 모름 (Provider Swap 패턴)
  - Navigation은 pathname 기반 active 상태 표시
  - VotingModal은 라디오 버튼 패턴으로 투표 유형 선택
  - 로딩 상태는 pulse-soft 스켈레톤
- **Files created/modified**:
  - src/app/layout.tsx, src/app/page.tsx
  - src/app/(app)/layout.tsx
  - src/app/(app)/dashboard/page.tsx
  - src/app/(app)/proposals/page.tsx
  - src/app/(app)/proposals/[id]/page.tsx
  - src/app/(app)/delegates/page.tsx
- **Verification**: npm run build 성공, npm run dev로 모든 페이지 200 OK 확인

### 캐릭터 중심 대시보드 리디자인 ✅
- **Date**: 2026-03-03
- **What was done**:
  - CharacterHero 컴포넌트 생성 — MoodImage(160px) + 컨텍스트 인식 인사말 + 퀵액션 버튼
  - SpeechBubble 서브컴포넌트 — glassmorphism 스타일 말풍선, useTypewriter 재사용, 삼각형 포인터
  - useDashboardGreeting 훅 — governance 데이터 기반 우선순위별 메시지 선택 (위임 안 함 → 활성 안건 → 투표력 0 → 기본)
  - 대시보드 페이지 리구성 — h1 제거, CharacterHero를 최상단에 배치, 기존 섹션(MetricsGrid, ActiveProposals, MyStatus, TopDelegates) 유지
- **Key decisions**:
  - 인사말 로직을 useMemo로 메모이제이션, mood 동기화는 useEffect로 분리
  - 말풍선은 backdrop-blur + bg-white/[0.07]로 glassmorphism 구현
  - 퀵액션 버튼은 타이프라이터 완료 후 slide-up-fade 애니메이션으로 표시
  - 기존 컴포넌트 변경 없음 — CharacterHero만 추가
- **Files created/modified**:
  - src/components/dashboard/CharacterHero.tsx (새로 생성)
  - src/app/(app)/dashboard/page.tsx (CharacterHero import + h1→CharacterHero 교체)
- **Verification**: npm run build 성공

## In Progress

### P1-4. wagmi + viem + Reown AppKit 설정
- **Started**: 2026-03-03
- **What**: wagmi + viem + Reown AppKit 인프라 설정, Web3Provider, useWalletConnection hook, 네비게이션 지갑 버튼 교체

## Blocked

(없음)
