# Session Start

새 세션을 시작합니다. PLAN.md와 PROGRESS.md를 읽고 현재 상황을 파악합니다.

## Steps

1. Read `PROGRESS.md` — Current Status 섹션에서 현재 phase, 다음 작업, blocker 확인
2. Read `PLAN.md` — 전체 작업 목록에서 미완료 항목 파악
3. Diff 분석:
   - PLAN.md에서 `- [ ]`인 항목 중 PROGRESS.md의 Completed에 없는 것 = 남은 작업
   - In Progress에 있는 항목 = 다른 에이전트가 작업 중 (충돌 방지)
   - Blocked에 있는 항목 = 차단된 작업 (선행 조건 확인)
4. 의존성 확인: 다음 작업의 선행 조건이 Completed에 있는지 검증

## Output

다음 형식으로 사용자에게 보고:

```
## Session Status

**Phase**: (현재 phase)
**Completed**: N/M tasks
**Blocked**: (있으면 표시)

## Next Available Tasks
1. P{x}-{y}. (작업 설명) — (의존성 상태)
2. ...

## Recommendation
(가장 우선적으로 진행할 작업과 이유)
```

## Important

- PLAN.md에 없는 작업을 임의로 시작하지 않는다.
- 여러 작업이 가능하면 ID 순서가 빠른 것을 우선 추천한다.
- blocker가 있으면 해결 방안도 함께 제시한다.
