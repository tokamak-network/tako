# Plan

## Phase 1: Project Setup
- [x] P1-1. Next.js 15 프로젝트 초기화 (TypeScript, Tailwind CSS v4, App Router, 핵심 패키지)
- [x] P1-2. shared/ 타입 + Provider 인터페이스 + 더미 데이터 + Provider 구현
- [x] P1-3. 디자인 시스템 이식 (dao-v2 tokens + ui/ + toki 다크 테마)
- [x] P1-4. wagmi + viem + Reown AppKit 설정 (Phase B, Phase A에서는 건너뜀)

## Phase 2: Governance UI (더미 데이터로 동작)
- [x] P2-1. 컨트랙트 hooks 래핑 — P1-4 완료 후 (Phase B)
- [x] P2-2. 대시보드 페이지 (/dashboard)
- [x] P2-3. 안건 목록 페이지 (/proposals)
- [x] P2-4. 안건 상세 + 투표 (/proposals/[id] + VotingModal)
- [x] P2-5. 위임 페이지 (/delegates + DelegationModal)

## Phase 3: Character System
- [x] P3-1. 캐릭터 에셋 이식 (mood 이미지 4종, glow 색상)
- [x] P3-2. 캐릭터 컴포넌트 (ChatBubble, ChatWindow, Typewriter, MoodImage)
- [x] P3-3. 정적 대화 트리 (거버넌스 기본 안내용) — chat-scripts.ts로 구현
- [x] P3-4. CharacterProvider (캐릭터 상태 관리)

## Phase 4: AI Agent Integration
- [x] P4-1. useAgentChat hook (dao-agent SSE 스트리밍 클라이언트)
- [x] P4-2. AI 대화 ↔ 캐릭터 mood 연결 (inferMood)
- [x] P4-3. 안건 상세 페이지에 캐릭터 분석 패널 통합
- [x] P4-4. CHAT + ANALYZE_PROPOSAL 모드 연동

## Phase 5: Migration Knowledge
- [ ] P5-1. authority-map.json 초기 버전 생성 (v1 47개 컨트랙트 매핑)
- [ ] P5-2. v1/v2 거버넌스 시스템 표시 분기 (UI에서 어느 시스템인지 표시)
