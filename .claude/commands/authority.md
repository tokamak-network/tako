# Check Contract Authority

컨트랙트의 현재 관리 주체(v1/v2)를 확인합니다.

User input: $ARGUMENTS

## Usage

```
/authority SeigManager          # 이름으로 조회
/authority 0x0b55...            # 주소로 조회
/authority                      # 전체 현황 요약
```

## Execution

1. Read `knowledge/authority-map.json`
2. 인자가 있으면: 해당 컨트랙트의 authority 정보 조회
3. 인자가 없으면: 전체 마이그레이션 현황 요약

## Output (단일 컨트랙트)

```
## SeigManagerProxy

- **Address**: 0x0b55a0f463b6defb81c6063973763951712d0e5f
- **Current authority**: v1 (DAOCommitteeProxy)
- **Target authority**: v2 (Timelock)
- **Migration status**: pending
- **Implication**: 이 컨트랙트에 대한 변경은 v1 시스템에서 안건을 올려야 합니다.
```

## Output (전체 현황)

```
## Migration Status

| Status | Count |
|--------|-------|
| Migrated to v2 | 0 |
| Pending | 47 |
| Total | 47 |

**Phase**: Pre-migration (v2 미배포)
```

## Fallback

`knowledge/authority-map.json`이 없으면:
- 사용자에게 P5-1 (authority-map 생성) 작업이 필요하다고 안내
- dao-agent의 `scripts/mainnet/contracts.json` 참조를 제안
