# Port from Source Project

소스 프로젝트(toki, dao-v2, dao-agent)에서 코드를 이식합니다.

User input: $ARGUMENTS

## Usage

```
/port toki character            # toki에서 캐릭터 시스템 이식
/port dao-v2 proposals          # dao-v2에서 안건 UI 이식
/port dao-v2 ui                 # dao-v2에서 디자인 시스템 이식
/port dao-v2 hooks              # dao-v2에서 컨트랙트 hooks 이식
/port dao-agent chat            # dao-agent에서 채팅 클라이언트 참조
```

## Source Paths

| Project | Alias | Base Path |
|---------|-------|-----------|
| toki | `toki` | `~/workspace/toki/src` |
| tokamak-dao-v2 | `dao-v2` | `~/workspace/tokamak-dao-v2/src` |
| tokamak-dao-agent | `dao-agent` | `~/workspace/tokamak-dao-agent/src` |

## Component Mapping

| Alias + Target | Source Files | Destination |
|----------------|-------------|-------------|
| `toki character` | `components/chat/`, `lib/toki-dialogue.ts`, `lib/achievements.ts` | `src/components/character/`, `src/lib/` |
| `dao-v2 ui` | `components/ui/` | `src/components/ui/` |
| `dao-v2 proposals` | `components/proposals/`, `app/(app)/proposals/` | `src/components/proposals/`, `src/app/(app)/proposals/` |
| `dao-v2 delegates` | `components/delegates/`, `app/(app)/delegates/` | `src/components/delegates/`, `src/app/(app)/delegates/` |
| `dao-v2 hooks` | `hooks/contracts/` | `src/hooks/contracts/` |
| `dao-v2 dashboard` | `components/dashboard/`, `app/(app)/dashboard/` | `src/components/dashboard/`, `src/app/(app)/dashboard/` |
| `dao-agent chat` | `web/server.ts`, `web/system-prompt.ts` | Reference only (별도 서비스) |

## Execution

1. **Read source**: 소스 프로젝트에서 해당 파일들을 읽는다
2. **Analyze dependencies**: import 경로, 의존하는 다른 컴포넌트, 외부 패키지 확인
3. **Adapt**: 이 프로젝트의 패턴에 맞게 수정
   - import 경로를 이 프로젝트 구조에 맞게 변경
   - 없는 의존성은 먼저 이식하거나 대체
   - 불필요한 기능 제거 (MVP 범위 참조)
4. **Write**: 목적지 경로에 파일 생성
5. **Verify**: import 오류 없는지 확인

## Rules

- 소스를 그대로 복사하지 않는다. 이 프로젝트 컨벤션에 맞게 적응시킨다.
- MVP 범위(CLAUDE.md 참조)에 없는 기능은 포함하지 않는다.
- 이식 후 PROGRESS.md에 어떤 파일을 어디서 가져왔는지 기록한다.
- 소스 프로젝트의 원본은 절대 수정하지 않는다.
