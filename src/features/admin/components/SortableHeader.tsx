import type { Column } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/components/ui/utils';

// 정렬 가능한 컬럼 헤더 — 버튼 형태.
// 활성 정렬 컬럼은 배경색이 계속 유지되어("눌려있는" 느낌), 지금 기준이 뭔지 한눈에 보이게 한다.
export function SortableHeader<T>({ column, label }: { column: Column<T, unknown>; label: string }) {
  const sorted = column.getIsSorted(); // false | 'asc' | 'desc'
  const isActive = sorted !== false;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
        isActive
          ? 'bg-ring/15 text-ring hover:bg-ring/25'           // 정렬 중 — 테마 포인트색으로 확실히 구분
          : 'text-foreground hover:bg-foreground/10',          // 평상시 — 테이블 배경 대비 뚜렷한 hover
      )}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp size={16} strokeWidth={2.5} />
      ) : sorted === 'desc' ? (
        <ArrowDown size={16} strokeWidth={2.5} />
      ) : (
        <ChevronsUpDown size={16} className="text-muted-foreground/60" />
      )}
    </button>
  );
}