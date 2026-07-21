import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateQnaComment, useQna } from '@/features/qna/hooks/useQnas';
import { QnaThread } from '@/features/qna/components/QnaThread';
import { QnaCommentForm } from '@/features/qna/components/QnaCommentForm';
import { QnaStatusBadge } from '@/features/qna/components/QnaStatusBadge';
import { getQnaAccessErrorMessage } from '@/features/qna/util';
import { formatDateTime } from '@/shared/utils/date';
import { Button } from '@/shared/components/ui/button';

export function QnaDetailPage() {
  const navigate = useNavigate();
  const { qnaId } = useParams();
  const numericId = Number(qnaId);

  const { data: qna, isLoading, error } = useQna(numericId);
  const createComment = useCreateQnaComment(numericId);

  // QNA_001(없는 문의)/QNA_002(타인 문의) → 안내 토스트 후 목록으로 되돌린다.
  // 그 외 에러는 아래 에러 문구로 수렴(401 등 공통 처리는 인터셉터 담당).
  const accessErrorMessage = getQnaAccessErrorMessage(error);
  useEffect(() => {
    if (accessErrorMessage) {
      toast.error(accessErrorMessage);
      navigate('/support/qnas', { replace: true });
    }
  }, [accessErrorMessage, navigate]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">불러오는 중…</div>;
  }
  if (error || !qna) {
    // 접근 에러는 위 effect가 리다이렉트하므로, 여기 남는 건 그 외 조회 실패다.
    return accessErrorMessage ? null : (
      <div className="p-8 text-center text-destructive">문의를 불러오지 못했습니다.</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <h1 className="text-xl font-semibold">{qna.title}</h1>
          <QnaStatusBadge status={qna.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(qna.createdAt)}
          {qna.answeredAt && ` · 답변 ${formatDateTime(qna.answeredAt)}`}
        </p>
      </div>

      <QnaThread qna={qna} />

      <div className="mt-6 space-y-2">
        <h2 className="text-sm font-medium">추가 문의</h2>
        <QnaCommentForm
          onSubmit={(payload) => createComment.mutateAsync(payload)}
          isPending={createComment.isPending}
          placeholder="추가로 궁금한 점을 입력해 주세요"
          submitLabel="등록"
        />
      </div>

      <div className="mt-4">
        <Button variant="outline" onClick={() => navigate('/support/qnas')}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
