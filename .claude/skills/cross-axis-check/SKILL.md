---
name: cross-axis-check
description: 세 축(UI, Contract, Agent) 간 변경 영향도를 자동 판단. 컨트랙트 hook, 타입 정의, ABI, 주소를 수정할 때 자동 호출.
allowed-tools: Read, Grep, Glob
---

# Cross-Axis Consistency Check

코드 변경이 다른 축에 영향을 미치는지 자동으로 확인합니다.

## When to Trigger

- shared/ 디렉터리의 파일이 변경될 때
- contracts/ 의 Solidity 코드가 변경될 때
- hooks/contracts/ 의 hook이 변경될 때
- Agent SSE 프로토콜 관련 코드가 변경될 때

## Check Matrix

| 변경 대상 | 확인할 영향 범위 |
|-----------|----------------|
| contracts/src/*.sol | → shared/abi/ 재생성 필요? → types.ts 업데이트 필요? → hooks 호환성? |
| shared/types.ts | → hooks에서 import하는 타입이 변경되었는가? → 에이전트 응답 파싱에 영향? |
| shared/addresses.ts | → wagmi config의 주소와 일치? → 에이전트 contracts.json과 일치? |
| shared/abi/*.json | → hooks의 ABI import 경로 정상? → 에이전트가 같은 ABI 사용? |
| hooks/contracts/*.ts | → 컴포넌트에서 hook 사용 방식이 변경되었는가? |
| shared/agent-types.ts | → useAgentChat hook이 새 이벤트 타입을 처리하는가? |

## Execution

1. 변경된 파일의 축 분류:
   - `contracts/`, `shared/abi/`, `shared/types.ts` → Contract 축
   - `components/`, `hooks/`, `app/` → UI 축
   - `shared/agent-types.ts`, agent 관련 코드 → Agent 축

2. 영향받는 다른 축 파일 탐색:
   - Grep으로 변경된 export를 import하는 파일 찾기
   - shared/ 타입을 사용하는 모든 파일 확인

3. 영향도 보고:

```
## Cross-Axis Impact

**Changed**: shared/types.ts (Contract axis)

**Affected files**:
- src/hooks/contracts/useDAOGovernor.ts (UI axis) — uses Proposal type
- src/components/proposals/ProposalCard.tsx (UI axis) — uses ProposalState

**Action needed**:
- [ ] Verify useDAOGovernor return type matches new Proposal interface
- [ ] Verify ProposalCard handles all ProposalState values
```

## Critical Enums — Always Verify

VoteType과 ProposalState는 컨트랙트 enum 순서와 정확히 일치해야 합니다:

```
VoteType:       Against=0, For=1, Abstain=2
ProposalState:  Pending=0, Active=1, Canceled=2, Defeated=3,
                Succeeded=4, Queued=5, Expired=6, Executed=7
```

이 값이 shared/enums.ts와 다른 곳에서 하드코딩되어 있으면 즉시 경고합니다.
