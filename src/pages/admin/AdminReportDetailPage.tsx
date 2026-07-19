import { useNavigate, useParams } from 'react-router-dom';
import {
  useAdminReport,
  useApproveReport,
  useRejectReport,
} from '@/features/admin/hooks/useAdminReports';
import { REPORT_REASON_LABEL, REPORT_TARGET_TYPE_LABEL } from '@/features/report/util';
import { ReportStatusBadge } from '@/pages/admin/AdminReportListPage';
import { formatDateTime } from '@/shared/utils/date';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';

export function AdminReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const id = reportId ? Number(reportId) : null;

  const { data: report, isLoading, isError } = useAdminReport(id);
  const approve = useApproveReport(id ?? 0);
  const reject = useRejectReport(id ?? 0);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">불러오는 중…</div>;
  }
  if (isError || !report) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">신고를 불러오지 못했습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/reports')}>
          목록으로
        </Button>
      </div>
    );
  }

  const isPending = report.status === 'PENDING';
  const isProcessing = approve.isPending || reject.isPending;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reports')}>
            ← 목록으로
          </Button>
          <h1 className="text-xl font-semibold">신고 상세</h1>
          <ReportStatusBadge status={report.status} />
        </div>

        {/* 처리 버튼은 미처리(PENDING) 건에만 노출한다 — 재처리는 백엔드가 REPORT_003으로 거부 */}
        {isPending && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isProcessing}>
                  승인 (대상 숨김)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>이 신고를 승인할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    대상이 즉시 숨김 처리되며, 회원 신고의 경우 강제 탈퇴됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => approve.mutate()}>승인</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" disabled={isProcessing} onClick={() => reject.mutate()}>
              반려
            </Button>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-md border p-5">
        <div>
          <span className="text-sm text-muted-foreground">신고 대상</span>
          <p className="flex items-center gap-2">
            <Badge variant="outline">{REPORT_TARGET_TYPE_LABEL[report.targetType]}</Badge>
            <span className="font-medium">#{report.targetId}</span>
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">신고 사유</span>
          <p className="font-medium">{REPORT_REASON_LABEL[report.reason]}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">신고자</span>
          <p className="font-medium">{report.reporterNickname}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">신고일</span>
          <p className="font-medium">{formatDateTime(report.createdAt)}</p>
        </div>
        {/* 처리 완료 건만 처리자/처리일시를 노출한다 */}
        {report.processorNickname && (
          <div>
            <span className="text-sm text-muted-foreground">처리자</span>
            <p className="font-medium">{report.processorNickname}</p>
          </div>
        )}
        {report.processedAt && (
          <div>
            <span className="text-sm text-muted-foreground">처리일시</span>
            <p className="font-medium">{formatDateTime(report.processedAt)}</p>
          </div>
        )}
      </div>

      {/* 누적 신고 건수 — 제재 수위 판단의 핵심 근거라 별도 블록으로 강조 */}
      <div className="mb-6 rounded-md border p-5">
        <h2 className="mb-1 text-sm font-semibold text-foreground">이 대상의 누적 신고</h2>
        <p className="text-2xl font-bold text-foreground">{report.targetReportCount}건</p>
        <p className="mt-1 text-sm text-muted-foreground">
          이번 건을 포함해 해당 대상이 신고된 총 횟수입니다.
        </p>
      </div>

      {/* 상세 내용 — 사유가 ETC일 때만 값이 있다 */}
      <div className="rounded-md border p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">상세 내용</h2>
        {report.content ? (
          <p className="whitespace-pre-wrap text-sm text-foreground">{report.content}</p>
        ) : (
          <p className="text-sm text-muted-foreground">작성된 상세 내용이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
