import { axiosInstance } from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@/features/report/api/reportApi';

// features/admin 도메인 API 모듈 — 관리자 신고 처리 (/api/admin/reports, hasRole(ADMIN)).
// 대상/사유/상태 enum은 유저용과 동일하므로 features/report/api/reportApi.ts를 재사용한다
// (중복 타입 정의 금지 — features/admin/api/qnaApi.ts가 features/qna/types를 쓰는 것과 같은 방식).

// ── 타입 (백엔드 DTO와 1:1) ──────────────────────────────────────────────

/** 응답: 목록 행 — ReportSummaryResponse */
export interface ReportSummaryResponse {
  reportId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  status: ReportStatus;
  reporterNickname: string;
  createdAt: string;
}

/** 응답: 상세 — ReportDetailResponse (목록 필드 + 처리 이력·누적 건수) */
export interface ReportDetailResponse extends ReportSummaryResponse {
  content: string | null; // ETC가 아니면 null
  processorNickname: string | null; // 미처리 시 null (필드 자체는 항상 내려온다)
  processedAt: string | null;
  targetReportCount: number; // 이 대상이 지금까지 신고당한 누적 건수 — 제재 판단 근거
}

/** 목록 검색 파라미터 — status/targetType은 미지정 시 전체 */
export interface AdminReportSearchParams {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
  size?: number;
}

// ── API 함수 ─────────────────────────────────────────────────────────────

/** 신고 목록 — GET /api/admin/reports */
export async function getAdminReports(
  params: AdminReportSearchParams = {},
): Promise<PageResponse<ReportSummaryResponse>> {
  const res = await axiosInstance.get<ApiResponse<PageResponse<ReportSummaryResponse>>>(
    '/admin/reports',
    { params: { page: 0, size: 10, ...params } },
  );
  return res.data.data as PageResponse<ReportSummaryResponse>;
}

/** 신고 상세 — GET /api/admin/reports/{reportId} */
export async function getAdminReport(reportId: number): Promise<ReportDetailResponse> {
  const res = await axiosInstance.get<ApiResponse<ReportDetailResponse>>(
    `/admin/reports/${reportId}`,
  );
  return res.data.data as ReportDetailResponse;
}

/**
 * 신고 승인 — PATCH /api/admin/reports/{reportId}/approve
 * 승인과 동시에 대상이 숨김 처리된다(회원 신고면 강제 탈퇴).
 * TODO: 응답 data 스펙 미확인 — 현재는 무시하고 상세를 재조회한다.
 */
export async function approveReport(reportId: number): Promise<void> {
  await axiosInstance.patch<ApiResponse<null>>(`/admin/reports/${reportId}/approve`);
}

/** 신고 반려 — PATCH /api/admin/reports/{reportId}/reject */
export async function rejectReport(reportId: number): Promise<void> {
  await axiosInstance.patch<ApiResponse<null>>(`/admin/reports/${reportId}/reject`);
}
