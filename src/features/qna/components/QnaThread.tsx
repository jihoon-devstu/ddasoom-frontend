import { cn } from '@/shared/components/ui/utils';
import { Badge } from '@/shared/components/ui/badge';
import { ImageThumbnailGrid } from '@/shared/components/common/ImageThumbnailGrid';
import { formatDateTime } from '@/shared/utils/date';
import type { QnaDetail } from '../types';

// 문의 스레드 — 질문(본문+첨부) + 코멘트 목록(시간순).
// 유저 상세/관리자 상세가 동일한 스레드를 보므로 공용 컴포넌트로 둔다.
// 관리자 코멘트는 배경·뱃지로 구분한다(writerRole 기준 — 로그인 사용자와 비교하지 않는다).

interface QnaThreadProps {
  qna: QnaDetail;
}

export function QnaThread({ qna }: QnaThreadProps) {
  return (
    <div className="space-y-4">
      {/* 질문 */}
      <article className="rounded-md border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{qna.questionerNickname}</span>
          <span>{formatDateTime(qna.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {qna.content}
        </p>
        {qna.images.length > 0 && (
          <div className="mt-3">
            <ImageThumbnailGrid images={qna.images} />
          </div>
        )}
      </article>

      {/* 코멘트 스레드 */}
      {qna.comments.map((comment) => {
        const isAdmin = comment.writerRole === 'ADMIN';
        return (
          <article
            key={comment.commentId}
            className={cn(
              'rounded-md border p-4',
              isAdmin
                ? 'border-primary/30 bg-primary/5 ml-6'
                : 'border-border bg-background',
            )}
          >
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{comment.writerNickname}</span>
              {isAdmin && <Badge variant="default">관리자</Badge>}
              <span>{formatDateTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {comment.content}
            </p>
            {comment.images.length > 0 && (
              <div className="mt-3">
                <ImageThumbnailGrid images={comment.images} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
