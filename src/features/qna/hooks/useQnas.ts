import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  createQna,
  createQnaComment,
  getQna,
  getQnas,
} from '@/features/qna/api/qnaApi';
import type { QnaCommentCreatePayload, QnaCreatePayload } from '../types';

// 유저용 1:1 문의 TanStack Query 훅 모음.

export function useQnas(params: { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.qna.list(params),
    queryFn: () => getQnas(params),
  });
}

export function useQna(qnaId: number | null) {
  return useQuery({
    queryKey: queryKeys.qna.detail(qnaId ?? 0),
    queryFn: () => getQna(qnaId as number),
    enabled: qnaId != null,
    // 첨부 이미지 url이 Presigned(30분)라 오래 신선하다고 간주하지 않는다 —
    // 재진입 시 새 url을 받도록 staleTime을 두지 않고 기본값(0)을 쓴다.
    retry: false, // QNA_001(없음)/QNA_002(타인 문의)는 재시도해도 동일 — 즉시 안내로
  });
}

export function useCreateQna() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QnaCreatePayload) => createQna(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qna.lists() });
      toast.success('문의가 등록되었습니다.');
    },
  });
}

export function useCreateQnaComment(qnaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QnaCommentCreatePayload) => createQnaComment(qnaId, payload),
    onSuccess: (detail) => {
      // 응답이 갱신된 상세 전체라 재조회 없이 캐시를 직접 교체한다(왕복 1회 절약).
      queryClient.setQueryData(queryKeys.qna.detail(qnaId), detail);
      // 목록의 status/answeredAt이 바뀌므로 목록은 무효화한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.qna.lists() });
      toast.success('문의가 등록되었습니다.');
    },
  });
}
