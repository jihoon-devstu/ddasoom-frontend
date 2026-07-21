import { Button } from '@/shared/components/ui/button';

// 페이지 번호 방식 페이지네이션 (이전 / 1 2 3 … / 다음).
// ⚠️ 공지·FAQ 목록은 "이전/다음"만 있는 간단 버전을 쓰지만, QnA는 번호 방식이 요구사항이라 별도로 둔다.
//    shadcn ui/pagination은 번호 생성 로직이 없고 라벨이 영문이라, Button 기반으로 직접 구성했다.

// 현재 페이지 주변으로 최대 5개 번호만 노출한다(페이지가 많아도 폭이 일정하게 유지되도록).
const WINDOW_SIZE = 5;

interface QnaPaginationProps {
  page: number; // 0-based (Spring 표준)
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onChange: (page: number) => void;
}

export function QnaPagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onChange,
}: QnaPaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(0, Math.min(page - Math.floor(WINDOW_SIZE / 2), totalPages - WINDOW_SIZE));
  const pageNumbers = Array.from(
    { length: Math.min(WINDOW_SIZE, totalPages) },
    (_, i) => start + i,
  );

  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevious}
        onClick={() => onChange(Math.max(0, page - 1))}
      >
        이전
      </Button>

      {pageNumbers.map((n) => (
        <Button
          key={n}
          variant={n === page ? 'default' : 'ghost'}
          size="sm"
          className="w-9"
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
        >
          {n + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => onChange(page + 1)}
      >
        다음
      </Button>
    </div>
  );
}
