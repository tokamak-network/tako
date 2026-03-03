---
name: check-governance
description: 거버넌스 기능 구현 시 v1/v2 적용 범위를 자동 판단. 컨트랙트나 거버넌스 관련 코드를 작성할 때 자동 호출.
allowed-tools: Read, Grep, Glob
---

# Check Governance Applicability

거버넌스 관련 기능을 구현하기 전에 v1, v2, 또는 양쪽 모두에 해당하는지 확인합니다.

## When to Trigger

- 컨트랙트 hook을 작성하거나 수정할 때
- 안건(proposal) 관련 UI를 만들 때
- 투표, 위임 기능을 구현할 때
- authority-map과 관련된 작업을 할 때

## Execution

1. Read `knowledge/authority-map.json` (있으면)
2. Read `CLAUDE.md`의 "Governance: V1 and V2" 섹션 참조
3. 대상 컨트랙트/기능이 v1, v2, 어디에 속하는지 판단:

### 판단 기준

| 대상 | v1 | v2 |
|------|----|----|
| DAOCommitteeProxy, DAOAgendaManager | ✓ | |
| DAOGovernor, Timelock, SecurityCouncil | | ✓ |
| DelegateRegistry, vTON | | ✓ |
| SeigManager, DepositManager, Layer2Registry | authority-map 참조 | authority-map 참조 |
| TON, WTON | 공통 (토큰 자체는 거버넌스 무관) | 공통 |

4. 결과를 에이전트에게 전달:

```
## Governance Check

**Target**: (컨트랙트/기능 이름)
**Applies to**: v1 / v2 / both / authority-map dependent
**Current authority**: (authority-map에서 조회)
**Implementation note**: (v1과 v2에서 호출 방식이 다른 경우 차이 설명)
```

## Key Differences to Watch

- v1: `DAOCommitteeProxy.executeAgenda()` — 위원회 3명 투표
- v2: `DAOGovernor.execute()` → `Timelock` — 위임 기반 투표
- v1: TON이 투표력 (스테이킹량)
- v2: vTON이 투표력 (위임량, 스냅샷 기반)
- v1: 안건 생성 100 TON
- v2: 안건 생성 10 TON + 0.25% vTON 보유
