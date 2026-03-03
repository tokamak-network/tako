# Update Progress

PROGRESS.md를 업데이트합니다.

User input: $ARGUMENTS

## Usage

```
/progress start P1-2          # P1-2 작업 시작
/progress done P1-2            # P1-2 작업 완료
/progress block P1-2 "reason"  # P1-2 차단 (사유)
```

## Execution

### `start` action

1. Read `PROGRESS.md`
2. In Progress 섹션에 해당 작업 추가:
   ```markdown
   ### P{x}-{y}. (PLAN.md에서 작업 제목 가져오기) 🔄
   - **Started**: (현재 날짜)
   - **Agent**: (현재 세션)
   ```
3. Current Status의 `Next task` 업데이트

### `done` action

1. Read `PROGRESS.md`
2. In Progress에서 해당 작업을 Completed로 이동
3. 완료 기록 작성:
   ```markdown
   ### P{x}-{y}. (작업 제목) ✅
   - **Date**: (현재 날짜)
   - **What was done**: (수행한 작업 요약)
   - **Key decisions**: (구현 중 내린 판단)
   - **Files created/modified**: (변경 파일 목록)
   - **Verification**: (검증 방법과 결과)
   ```
4. PLAN.md에서 해당 항목을 `- [x]`로 체크
5. Current Status 업데이트 (Next task 갱신)

### `block` action

1. Read `PROGRESS.md`
2. In Progress에서 Blocked로 이동
3. 차단 기록:
   ```markdown
   ### P{x}-{y}. (작업 제목) ⛔
   - **Blocked since**: (현재 날짜)
   - **Reason**: (차단 사유)
   - **Resolution**: (해결 방안 제안)
   - **Depends on**: (선행 작업 ID, 있으면)
   ```

## Important

- `done` 시 반드시 Key decisions와 Files 목록을 기록한다 — 다음 에이전트를 위해.
- 작업 ID는 PLAN.md에 존재하는 것만 사용한다.
- Current Status 섹션은 항상 최신 상태로 유지한다.
