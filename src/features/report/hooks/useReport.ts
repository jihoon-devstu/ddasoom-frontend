import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createReport, type ReportCreatePayload } from '@/features/report/api/reportApi';
import { getReportErrorMessage } from '@/features/report/util';

// 유저 신고 TanStack Query 훅.
// 신고 결과는 어떤 목록/상세에도 반영되지 않으므로(관리자만 열람) invalidate 대상이 없다.

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: ReportCreatePayload) => createReport(payload),
    onSuccess: () => {
      toast.success('신고가 접수되었습니다.');
    },
    onError: (error) => {
      // REPORT_002(중복)/REPORT_005(자기 신고)는 사용자가 고칠 수 있는 상황이라 코드별로 안내한다.
      toast.error(getReportErrorMessage(error, '신고 접수에 실패했습니다.'));
    },
  });
}
