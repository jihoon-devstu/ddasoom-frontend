import { Badge } from '@/shared/components/ui/badge';
import type { QnaStatus } from '../types';

// 문의 상태 뱃지 — 유저/관리자 목록·상세 공용.
const STATUS_LABEL: Record<QnaStatus, string> = {
  PENDING: '답변 대기',
  ANSWERED: '답변 완료',
};

interface QnaStatusBadgeProps {
  status: QnaStatus;
}

export function QnaStatusBadge({ status }: QnaStatusBadgeProps) {
  return (
    <Badge variant={status === 'ANSWERED' ? 'default' : 'secondary'}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
