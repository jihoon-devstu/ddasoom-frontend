import { axiosInstance } from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  QnaCommentCreatePayload,
  QnaCreatePayload,
  QnaDetail,
  QnaSummary,
} from '../types';

// features/qna 도메인 API 모듈 — 유저용 1:1 문의 (/api/qnas, 로그인 필수).
// 관리자용은 features/admin/api/qnaApi.ts (엔드포인트가 /api/admin/qnas로 다름).

/** 내 문의 목록 — GET /api/qnas */
export async function getQnas(
  params: { page?: number; size?: number } = {},
): Promise<PageResponse<QnaSummary>> {
  const res = await axiosInstance.get<ApiResponse<PageResponse<QnaSummary>>>('/qnas', {
    params: { page: 0, size: 10, ...params },
  });
  return res.data.data as PageResponse<QnaSummary>;
}

/** 문의 상세 — GET /api/qnas/{qnaId} */
export async function getQna(qnaId: number): Promise<QnaDetail> {
  const res = await axiosInstance.get<ApiResponse<QnaDetail>>(`/qnas/${qnaId}`);
  return res.data.data as QnaDetail;
}

/** 문의 작성 — POST /api/qnas */
export async function createQna(payload: QnaCreatePayload): Promise<QnaSummary> {
  const res = await axiosInstance.post<ApiResponse<QnaSummary>>('/qnas', payload);
  return res.data.data as QnaSummary;
}

/**
 * 재질문 코멘트 작성 — POST /api/qnas/{qnaId}/comments
 * 응답이 갱신된 상세 전체(QnaDetail)라 별도 재조회 없이 캐시를 교체할 수 있다.
 */
export async function createQnaComment(
  qnaId: number,
  payload: QnaCommentCreatePayload,
): Promise<QnaDetail> {
  const res = await axiosInstance.post<ApiResponse<QnaDetail>>(
    `/qnas/${qnaId}/comments`,
    payload,
  );
  return res.data.data as QnaDetail;
}
