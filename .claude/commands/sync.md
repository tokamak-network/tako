# Sync Shared Layer

컨트랙트 빌드/배포 결과를 shared/ 레이어에 동기화합니다.

User input: $ARGUMENTS

## Usage

```
/sync contracts    # ABI + types + enums 동기화
/sync deploy       # 배포 주소 동기화
/sync all          # 전부 동기화
/sync validate     # 일관성 검증만 수행
```

## `contracts` — 컨트랙트 빌드 결과 동기화

1. `contracts/` 디렉터리에서 `forge build` 실행
2. `contracts/out/` 에서 필요한 ABI 추출:
   - DAOGovernor.sol/DAOGovernor.json → `shared/abi/DAOGovernor.json`
   - DelegateRegistry.sol/DelegateRegistry.json → `shared/abi/DelegateRegistry.json`
   - vTON.sol/vTON.json → `shared/abi/vTON.json`
   - Timelock.sol/Timelock.json → `shared/abi/Timelock.json`
   - SecurityCouncil.sol/SecurityCouncil.json → `shared/abi/SecurityCouncil.json`
3. ABI에서 TypeScript 타입 생성 → `shared/types.ts`
   - Proposal struct → TypeScript interface
   - VoteType enum → TypeScript union type
   - ProposalState enum → TypeScript union type
   - Event types → TypeScript interfaces
4. enum label 매핑 생성 → `shared/enums.ts`

## `deploy` — 배포 주소 동기화

1. `contracts/broadcast/` 또는 배포 로그에서 컨트랙트 주소 추출
2. `shared/addresses.ts` 업데이트 (chain ID별)
3. 변경 사항 요약 출력

## `validate` — 일관성 검증

다음 항목을 검증하고 불일치 시 경고:

1. **ABI 일치**: shared/abi/ 파일이 contracts/out/ 최신 빌드와 동일한가
2. **타입 일치**: shared/types.ts 가 shared/abi/ 와 동기화되어 있는가
3. **주소 일치**: shared/addresses.ts 주소가 실제 온체인에 코드가 존재하는가
4. **Import 검증**: src/ 하위 코드가 shared/ 에서 타입/ABI를 import하는가
   - 직접 ABI를 정의하는 코드가 있으면 경고
   - 직접 enum 값을 하드코딩하는 코드가 있으면 경고
5. **Agent 호환**: Agent 서버의 contracts.json 주소가 shared/addresses.ts 와 일치하는가

## Output

```
## Sync Report

✅ ABI: 5/5 contracts synced
✅ Types: shared/types.ts regenerated
✅ Enums: shared/enums.ts regenerated
⚠️ Address: mainnet addresses not yet deployed (expected for pre-migration)

## Validation
✅ No hardcoded ABIs found in src/
✅ No hardcoded enum values found in src/
⚠️ Agent contracts.json has 47 v1 contracts not in shared/addresses.ts (v1 contracts — expected)
```

## Important

- shared/ 의 파일은 **수동으로 편집하지 않는다**. 항상 이 sync 과정을 통해 생성한다.
- 컨트랙트를 변경한 후에는 반드시 `/sync contracts` 를 실행한다.
- 배포 후에는 반드시 `/sync deploy` 를 실행한다.
