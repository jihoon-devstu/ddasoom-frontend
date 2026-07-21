# 관리자페이지 - 데이터테이블 라이브러리 가이드

Status: Not started
날짜: 2026/07/16
분류: 정보공유
작성자: 나긋

## 📊 TanStack Table 도입 가이드

관리자 유저 관리 목록에 데이터테이블 라이브러리(`@tanstack/react-table`)를 도입했습니다. 검색/정렬/페이징이 필요한 다른 관리자 목록(임시보호 신청, 게시글 관리 등)에도 그대로 재사용 가능하니 공유합니다. — 작성: 지훈

### 1. 왜 도입했나

기존엔 검색어를 입력할 때마다 서버에 쿼리를 다시 날리는 방식이었습니다. 디바운스로 요청 횟수는 줄일 수 있었지만, 근본적으로 "타이핑할 때마다 로딩 상태가 됐다가 풀리는" 경험 자체가 매끄럽지 않았고, 로딩 처리 방식에 따라 입력창이 통째로 리렌더링되며 커서가 사라지는 문제도 있었습니다.

우리 관리자 목록 데이터는 전부 **데모 규모(수십~수백 건)**입니다. 이 규모에서는 **최초 1회만 서버에서 전체를 받아오고, 이후 검색·정렬·페이징은 전부 브라우저 메모리에서 처리**하는 게 훨씬 낫습니다. 서버 요청이 0회로 줄고, 반응 속도는 즉각적입니다.

- shadcn/ui 공식 Data Table 패턴이 TanStack Table 기반이라, 우리가 이미 쓰는 `Table` UI 컴포넌트를 그대로 두고 로직(정렬/필터/페이징 상태 관리)만 얹는 방식입니다. **headless 라이브러리**라 디자인은 우리 마음대로, 로직만 가져다 씁니다.
- 회원 수가 실제로 많아지면 `manualPagination` 옵션으로 서버 사이드 모드 전환도 가능합니다 — 지금 방식이 나중에 발목 잡지 않습니다.

### 2. 설치

```
npm i @tanstack/react-table
```

### 3. 공통 컴포넌트 — `SortableHeader`

정렬 가능한 컬럼 헤더를 반복해서 만들지 않도록 컴포넌트로 뽑아뒀습니다.

**위치**: `features/admin/components/SortableHeader.tsx`

**가져다 쓰는 법** — 컬럼 정의의 `header`에 넣기만 하면 끝입니다.

tsx

```tsx
import { SortableHeader } from '@/features/admin/components/SortableHeader';

const columns: ColumnDef<MyRowType>[] = [
	{    
		accessorKey :'email',
		header : ({ column }) => <SortableHeadercolumn={column}label="이메일"/>,
		cell : ({ row }) => <span>{row.original.email}</span>,
	},
	// ...
];
```

**동작**: 클릭할 때마다 미정렬 → 오름차순(↑) → 내림차순(↓) 순환. 현재 정렬 중인 컬럼은 hover 여부와 무관하게 포인트색 배경이 계속 유지되어, "지금 뭘 기준으로 정렬 중인지"가 스크롤해도 눈에 계속 보입니다. `features/admin` 공용이니 이 파일은 수정 전 팀에 공지해 주세요(다른 담당자 목록에서도 쓰게 됨).

### 4. 기본 사용 패턴 (유저 관리 목록 참고)

tsx

```tsx
const table = useReactTable({
  data: members,// 서버에서 1회 받아온 전체 배열 
  columns,  
  state:{ sorting, globalFilter, columnFilters},
  onSortingChange: setSorting,  
  onGlobalFilterChange: setGlobalFilter,  
  globalFilterFn,  
  getCoreRowModel: getCoreRowModel(),  
  getFilteredRowModel: getFilteredRowModel(),  
  getSortedRowModel: getSortedRowModel(),  
  getPaginationRowModel: getPaginationRowModel(),  
  initialState:{ pagination : { pageSize:10 } },
});
```

렌더링은 `table.getHeaderGroups()` / `table.getRowModel().rows`를 돌면서 기존 `Table`/`TableRow`/`TableCell` 그대로 씁니다. 상세 예시는 `pages/admin/AdminMemberListPage.tsx` 전체를 참고해 주세요 — 검색, Role 필터, 정렬, 페이징이 다 들어간 완성 예제입니다.

### 5. ⚠️ 실전에서 겪은 사고 — 반드시 지킬 것

목록 페이지를 만드는 중 **브라우저가 먹통이 되는 무한루프**를 실제로 겪었습니다. 원인과 규칙을 공유합니다.

**문제**: `state`에 넘기는 배열/함수를 컴포넌트 안에서 매 렌더링마다 새로 만들면, TanStack Table이 "값이 바뀌었다"고 오판해서 내부적으로 페이지를 리셋하고, 그게 리렌더링을 부르고, 리렌더링이 다시 새 배열/함수를 만들고… 무한 루프에 빠집니다. 겉으로는 "인터넷이 멈춘 것처럼" 보이지만 실제로는 네트워크가 아니라 **JS 렌더링 루프가 브라우저를 잡아먹은 것**입니다.

tsx

```tsx
// ❌ 절대 이렇게 쓰지 않기 — 렌더링마다 새 배열/함수가 생성됨
state:{  
	columnFilters: role==='ALL'?[]:[{ id:'role', value: role}], // 매번 새 배열
	},
	globalFilterFn:(row, id, value) => {...},// 매번 새 함수
```

**규칙**: `state`에 넘기는 값 중 **배열·객체는 `useMemo`로, 함수는 컴포넌트 바깥(모듈 스코프)이나 `useCallback`으로** 감싸서 참조가 안정되게 만듭니다.

tsx

```tsx
// ✅ 올바른 방식

// 1) 함수는 컴포넌트 바깥에 — 참조가 절대 안 바뀜

functionglobalFilterFn(row, columnId, filterValue){...}

functionMyListPage(){
	// 2) 배열/객체는 실제로 값이 바뀔 때만 새로 만들어지도록 useMemo
	const columnFilters=useMemo(
		()=>(role==='ALL'?[]:[{ id:'role', value: role}]),
		[role],
	);
	
	const table=useReactTable({    
		state:{ columnFilters},    
		globalFilterFn,
			// ...
		});
	}
```

`sorting`, `globalFilter`처럼 원시값(문자열)은 상관없지만, 배열이나 함수는 항상 이 규칙을 의식해 주세요.

### 6. 파생 값으로 정렬하는 법 (상태 컬럼 등)

원본 필드가 그대로 정렬하기 애매한 경우(예: `deletedAt`이 null/문자열 뒤섞임) `accessorFn`으로 정렬용 값을 따로 만들고, `cell`은 원본 데이터로 화면을 그리면 됩니다 — 정렬 기준과 화면 표시를 분리하는 패턴입니다.

tsx

```tsx
{  
	id:'status',
	accessorFn:(row)=>(row.deletedAt?1:0), // 정렬용 파생값 (활성=0, 탈퇴=1)
	header:({ column})=><SortableHeadercolumn={column}label="상태"/>,
	cell:({ row})=>(    
		row.original.deletedAt
			?  <Badgevariant="destructive">탈퇴</Badge>
			:  <Badgevariant="secondary">활성</Badge>
	),
}
```

### 7. 로딩/에러 처리 — 반드시 테이블 안쪽에

`isLoading`일 때 페이지 전체를 다른 컴포넌트로 갈아치우면, 검색창 같은 입력 요소가 통째로 사라졌다가 다시 생기면서 **입력 중이던 포커스/커서가 날아갑니다.** 로딩·에러·빈 상태는 `TableBody` 안의 행(`TableRow`) 하나로 표현해서, 검색창 등 다른 UI는 항상 마운트 상태를 유지하게 해주세요.

tsx

```tsx
<TableBody>
	{isLoading?(
		<TableRow><TableCell colSpan={columns.length}>불러오는 중…</TableCell></TableRow>
	) : isError ? ( 
		<TableRow><TableCell colSpan={columns.length}>목록을 불러오지 못했습니다.</TableCell></TableRow>
	):(    
		table.getRowModel().rows.map((row)=>(/* ... */))
	)}
</TableBody>
```

### 8. 요약 체크리스트 (새 관리자 목록 만들 때)

- [ ]  데이터 규모가 데모급이면 전체 1회 로드 + 클라이언트 필터링 방식 채택
- [ ]  정렬 헤더는 `SortableHeader` 재사용 (새로 안 만들기)
- [ ]  `state`에 넘기는 배열/객체는 `useMemo`, 함수는 모듈 스코프 또는 `useCallback`
- [ ]  파생 정렬이 필요하면 `accessorFn` + `cell` 분리
- [ ]  로딩/에러/빈 상태는 테이블 바깥이 아니라 `TableBody` 안 행으로 표현