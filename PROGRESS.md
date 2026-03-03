# Progress

## Current Status
- **Last updated**: 2026-03-03
- **Current phase**: Phase 4 — AI Agent Integration
- **Next task**: P4-3 (안건 상세 페이지에 캐릭터 분석 패널 통합)
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

### P1-4. wagmi + viem + Reown AppKit 설정 ✅
- **Date**: 2026-03-03
- **What was done**:
  - wagmi, viem, @reown/appkit, @reown/appkit-adapter-wagmi, @tanstack/react-query 설치
  - wagmi 설정 (sepolia 기본 + mainnet, Alchemy 선택적 transport, SSR cookieStorage)
  - Web3Provider (createAppKit 모듈 레벨 초기화, WagmiProvider > QueryClientProvider > WalletConnectionProvider)
  - useWalletConnection hook (isReady/isConnected/address 상태, 미지원 체인 sepolia 자동 전환)
  - 루트 레이아웃에 Web3Provider 래핑, 앱 네비게이션의 하드코딩 주소 버튼 → `<appkit-button />` 교체
  - appkit-button JSX 타입 선언 추가
- **Key decisions**:
  - dao-v2에서 sandbox chain/localhost/custom transport 전부 제거 — sepolia + mainnet만 지원
  - Reown projectId는 dao-v2와 동일 사용 (ed9db8435ea432ec164cf02c06c0b969)
  - 지갑 버튼은 Reown의 `<appkit-button />` 웹 컴포넌트 사용 (dao-v2의 CustomConnectButton 대신 심플하게)
  - Web3Provider를 루트 레이아웃에 배치 (모든 페이지에서 wagmi/react-query 사용 가능)
  - 미지원 체인 연결 시 sepolia + mainnet(1)만 허용, 나머지는 sepolia로 자동 전환
- **Files created/modified**:
  - src/config/wagmi.ts (새로 생성)
  - src/providers/Web3Provider.tsx (새로 생성)
  - src/hooks/useWalletConnection.tsx (새로 생성)
  - src/types/appkit.d.ts (새로 생성 — JSX 타입 선언)
  - src/app/layout.tsx (Web3Provider 래핑 추가)
  - src/app/(app)/layout.tsx (Button import 제거, appkit-button 교체)
- **Verification**: npm run build 성공

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

### P2-1. 컨트랙트 hooks 래핑 ✅
- **Date**: 2026-03-03
- **What was done**:
  - shared/abi/ — 4개 ABI 파일 (DAOGovernor, DelegateRegistry, vTON, Timelock) + index.ts re-export
  - shared/addresses.ts — Sepolia + Mainnet(placeholder) 주소, getContractAddresses/areContractsDeployed/getDeploymentBlock 함수
  - src/hooks/contracts/helpers.ts — useContracts hook, formatUnits18, blockToTimestamp, extractTitle
  - src/hooks/contracts/useVTON.ts — useTotalSupply, useMaxSupply, useCurrentEpoch, useVTONBalance, useVotingPower
  - src/hooks/contracts/useDAOGovernor.ts — useAllProposalIds, useProposal, useProposals, useGovernanceParams, useHasVoted, useCastVote
  - src/hooks/contracts/useDelegateRegistry.ts — useAllDelegates, useDelegateInfo, useDelegates, useMyDelegations, useDelegate, useUndelegate
  - src/hooks/contracts/useTimelock.ts — useTimelockDelay
  - GovernanceContext를 context.ts로 분리 (두 provider가 공유)
  - OnChainGovernanceProvider — 동일한 GovernanceDataProvider 인터페이스를 온체인 hooks로 구현
  - AutoGovernanceProvider — 지갑 연결 여부에 따라 OnChain/Dummy provider 자동 전환
  - layout.tsx에서 GovernanceProvider → AutoGovernanceProvider 교체
- **Key decisions**:
  - Provider Swap 패턴 유지 — 페이지 코드 변경 없이 더미 → 온체인 전환
  - bigint → number 변환은 hooks 레벨에서 처리 (formatUnits18)
  - block number → timestamp 변환은 현재 블록 기준 추정 (BLOCK_TIME_SECONDS = 12)
  - GovernanceDataProvider의 hook 함수들을 모듈 레벨 함수로 구현하여 참조 안정성 확보
  - useState(() => ...) 패턴으로 provider 객체를 한 번만 생성 → context value stable
  - shared/ 의 ABI는 dao-v2 contracts.ts에서 MVP에 필요한 함수만 추출 (read + write + events)
  - sandbox/localhost 체인 제거 — sepolia + mainnet만 지원
- **Files created/modified**:
  - shared/abi/DAOGovernor.ts, DelegateRegistry.ts, vTON.ts, Timelock.ts, index.ts (새로 생성)
  - shared/addresses.ts (새로 생성)
  - src/hooks/contracts/helpers.ts, useVTON.ts, useDAOGovernor.ts, useDelegateRegistry.ts, useTimelock.ts, index.ts (새로 생성)
  - src/providers/governance/context.ts (새로 생성)
  - src/providers/governance/OnChainGovernanceProvider.tsx (새로 생성)
  - src/providers/governance/AutoGovernanceProvider.tsx (새로 생성)
  - src/providers/governance/GovernanceProvider.tsx (context import 변경, useGovernance re-export)
  - src/app/(app)/layout.tsx (GovernanceProvider → AutoGovernanceProvider 교체)
- **Verification**: npm run build 성공, 모든 페이지 정상 생성 확인

### P4-2. AI 대화 ↔ 캐릭터 mood 연결 (inferMood) ✅
- **Date**: 2026-03-03
- **What was done**:
  - src/lib/mood.ts — inferMood 함수 추출 (키워드 패턴 매칭: thinking/explain/excited/welcome)
  - CharacterProvider — 인라인 inferMoodFromContent 제거, mood.ts에서 import
  - ChatWindow — useEffect로 mood 자동 동기화 (isLoading → thinking, 완료 → inferMood(lastAssistantContent))
- **Key decisions**:
  - mood 동기화를 ChatWindow에 배치 — 채팅창이 열려 있을 때만 mood 변경 (대시보드 CharacterHero의 인사말 mood와 충돌 방지)
  - isLoading 기반 동기화로 dummy/agent 양쪽 provider 모두 호환
  - 키워드 패턴 확장: problem/concern/issue (explain), awesome/perfect (excited), simulating/decoding/fetching (thinking)
  - inferMood에서 thinking 패턴 우선순위 최고 — 분석 중 "risk" 등이 포함되어도 thinking 유지
- **Files created/modified**:
  - src/lib/mood.ts (새로 생성)
  - src/providers/character/CharacterProvider.tsx (inferMood import)
  - src/components/character/ChatWindow.tsx (mood sync useEffect 추가)
- **Verification**: npm run build 성공

### P4-1. useAgentChat hook (dao-agent SSE 스트리밍 클라이언트) ✅
- **Date**: 2026-03-03
- **What was done**:
  - shared/agent-types.ts에 AgentChatRequest 인터페이스 추가
  - ChatContext + useChat을 context.ts로 분리 (GovernanceContext와 동일 패턴)
  - agent-client.ts — checkAgentHealth (3초 timeout) + streamChat (fetch + ReadableStream → AsyncGenerator<ChatSSEEvent>)
  - useAgentChat hook — SSE 이벤트별 처리 (text_delta, tool_use, tool_result, thinking, done, error), AbortController 취소 지원
  - AgentChatProvider — useAgentChat → ChatContext.Provider 연결
  - AutoChatProvider — mount 시 health check, 에이전트 사용 가능 → Agent, 불가 → Dummy
  - ChatWindow — parts 렌더링 추가 (text, tool_call 배지, thinking pulse), parts 없으면 기존 content 렌더링 (dummy 호환)
  - layout.tsx에서 ChatProvider → AutoChatProvider 교체
  - .env.local에 NEXT_PUBLIC_AGENT_URL=http://localhost:3333 설정
- **Key decisions**:
  - Provider Swap 패턴 유지 — AutoGovernanceProvider와 동일 구조 (health check → fallback)
  - EventSource 대신 fetch + ReadableStream 사용 (POST 지원 필요)
  - SSE 파싱은 `data:` 라인 기반 직접 파싱 (서드파티 라이브러리 없음)
  - 스트리밍 중 새 메시지 전송 시 이전 AbortController.abort()로 정리
  - tool 배지는 isRunning 상태에 따라 pulse 애니메이션 / 체크마크 표시
  - Health check는 mount 시 1회만 실행 (checked 전/실패 시 dummy 즉시 렌더)
- **Files created/modified**:
  - shared/agent-types.ts (AgentChatRequest 추가)
  - src/providers/chat/context.ts (새로 생성)
  - src/providers/chat/ChatProvider.tsx (context import 변경)
  - src/lib/agent-client.ts (새로 생성)
  - src/hooks/useAgentChat.ts (새로 생성)
  - src/providers/chat/AgentChatProvider.tsx (새로 생성)
  - src/providers/chat/AutoChatProvider.tsx (새로 생성)
  - src/app/(app)/layout.tsx (AutoChatProvider 교체)
  - src/components/character/ChatWindow.tsx (parts 렌더링, context import)
  - .env.local (새로 생성)
- **Verification**: npm run build 성공, 모든 페이지 정상 생성 확인

## In Progress

(없음)

## Blocked

(없음)
