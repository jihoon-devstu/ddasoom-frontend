import { useNavigate, useParams } from 'react-router-dom';
import { useAdminQna, useCreateAdminQnaComment } from '@/features/admin/hooks/useAdminQnas';
import { QnaThread } from '@/features/qna/components/QnaThread';
import { QnaCommentForm } from '@/features/qna/components/QnaCommentForm';
import { QnaStatusBadge } from '@/features/qna/components/QnaStatusBadge';
import { getErrorCode } from '@/features/qna/util';
import { formatDateTime } from '@/shared/utils/date';
import { Button } from '@/shared/components/ui/button';

export function AdminQnaDetailPage() {
  const navigate = useNavigate();
  const { qnaId } = useParams();
  const numericId = Number(qnaId);

  const { data: qna, isLoading, error } = useAdminQna(numericId);
  const createComment = useCreateAdminQnaComment(numericId);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">불러오는 중…</div>;
  }
  if (error || !qna) {
    // 관리자는 모든 문의에 접근 가능하므로 QNA_002는 발생하지 않는다 — QNA_001만 구분한다.
    const message =
      getErrorCode(error) === 'QNA_001'
        ? '존재하지 않는 문의입니다.'
        : '문의를 불러오지 못했습니다.';
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{message}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/qnas')}>
          목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <h1 className="text-xl font-semibold">{qna.title}</h1>
          <QnaStatusBadge status={qna.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {qna.questionerNickname} · {formatDateTime(qna.createdAt)}
          {qna.answeredAt && ` · 답변 ${formatDateTime(qna.answeredAt)}`}
        </p>
      </div>

      <QnaThread qna={qna} />

      <div className="mt-6 space-y-2">
        <h2 className="text-sm font-medium">답변 작성</h2>
        <QnaCommentForm
          onSubmit={(payload) => createComment.mutateAsync(payload)}
          isPending={createComment.isPending}
          placeholder="답변 내용을 입력하세요"
          submitLabel="답변 등록"
        />
      </div>

      <div className="mt-4">
        <Button variant="outline" onClick={() => navigate('/admin/qnas')}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
