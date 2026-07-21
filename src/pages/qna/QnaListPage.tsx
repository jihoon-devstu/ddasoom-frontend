import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQnas } from '@/features/qna/hooks/useQnas';
import { QnaStatusBadge } from '@/features/qna/components/QnaStatusBadge';
import { QnaPagination } from '@/features/qna/components/QnaPagination';
import { formatDate } from '@/shared/utils/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';

export function QnaListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQnas({ page, size: 10 });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">불러오는 중…</div>;
  }
  if (isError) {
    return <div className="p-8 text-center text-destructive">목록을 불러오지 못했습니다.</div>;
  }

  const qnas = data?.content ?? [];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">1:1 문의</h1>
        <Button onClick={() => navigate('/support/qnas/new')}>문의하기</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="w-28">상태</TableHead>
              <TableHead className="w-32">작성일</TableHead>
              <TableHead className="w-32">답변일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qnas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  등록된 문의가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              qnas.map((qna) => (
                <TableRow
                  key={qna.qnaId}
                  className="cursor-pointer"
                  onClick={() => navigate(`/support/qnas/${qna.qnaId}`)}
                >
                  <TableCell className="font-medium">{qna.title}</TableCell>
                  <TableCell>
                    <QnaStatusBadge status={qna.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(qna.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {qna.answeredAt ? formatDate(qna.answeredAt) : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QnaPagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages ?? 1}
        hasPrevious={data?.hasPrevious ?? false}
        hasNext={data?.hasNext ?? false}
        onChange={setPage}
      />
    </div>
  );
}
