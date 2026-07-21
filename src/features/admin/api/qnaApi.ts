import { axiosInstance } from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  QnaCommentCreatePayload,
  QnaDetail,
  QnaStatus,
  QnaSummary,
} from '@/features/qna/types';

// features/admin 도메인 API 모듈 — 관리자 1:1 문의 관리 (/api/admin/qnas, hasRole(ADMIN)).
// DTO는 유저용과 동일하므로 features/qna/types.ts를 재사용한다(중복 타입 정의 금지).

/** 관리자 문의 목록 — GET /api/admin/qnas. status 미지정 시 전체. */
export async function getAdminQnas(
  params: { status?: QnaStatus; page?: number; size?: number } = {},
): Promise<PageResponse<QnaSummary>> {
  const res = await axiosInstance.get<ApiResponse<PageResponse<QnaSummary>>>('/admin/qnas', {
    params: { page: 0, size: 10, ...params },
  });
  return res.data.data as PageResponse<QnaSummary>;
}

/** 관리자 문의 상세 — GET /api/admin/qnas/{qnaId} */
export async function getAdminQna(qnaId: number): Promise<QnaDetail> {
  const res = await axiosInstance.get<ApiResponse<QnaDetail>>(`/admin/qnas/${qnaId}`);
  return res.data.data as QnaDetail;
}

/**
 * 답변 코멘트 작성 — POST /api/admin/qnas/{qnaId}/comments
 * 응답이 갱신된 상세 전체(status가 ANSWERED로 전환된 상태)라 재조회 없이 캐시를 교체할 수 있다.
 */
export async function createAdminQnaComment(
  qnaId: number,
  payload: QnaCommentCreatePayload,
): Promise<QnaDetail> {
  const res = await axiosInstance.post<ApiResponse<QnaDetail>>(
    `/admin/qnas/${qnaId}/comments`,
    payload,
  );
  return res.data.data as QnaDetail;
}
