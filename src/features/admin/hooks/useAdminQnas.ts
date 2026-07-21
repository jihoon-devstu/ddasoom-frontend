import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  createAdminQnaComment,
  getAdminQna,
  getAdminQnas,
} from '@/features/admin/api/qnaApi';
import type { QnaCommentCreatePayload, QnaStatus } from '@/features/qna/types';

// 관리자 1:1 문의 TanStack Query 훅 모음.

export function useAdminQnas(
  params: { status?: QnaStatus; page?: number; size?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.admin.qnaList(params),
    queryFn: () => getAdminQnas(params),
  });
}

export function useAdminQna(qnaId: number | null) {
  return useQuery({
    queryKey: queryKeys.admin.qnaDetail(qnaId ?? 0),
    queryFn: () => getAdminQna(qnaId as number),
    enabled: qnaId != null,
    retry: false, // QNA_001(없는 문의)은 재시도해도 동일 — 즉시 안내로
  });
}

export function useCreateAdminQnaComment(qnaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QnaCommentCreatePayload) => createAdminQnaComment(qnaId, payload),
    onSuccess: (detail) => {
      // 응답이 status=ANSWERED로 갱신된 상세 전체 → 캐시 교체로 즉시 반영(재조회 불필요).
      queryClient.setQueryData(queryKeys.admin.qnaDetail(qnaId), detail);
      // 상태가 바뀌어 목록의 필터·뱃지·답변일이 달라지므로 목록은 무효화한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.qnas() });
      toast.success('답변이 등록되었습니다.');
    },
  });
}
