import { axiosInstance } from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// features/report 도메인 API 모듈 — 유저 신고 접수 (/api/reports, 로그인 필수).
// 관리자 처리용은 features/admin/api/adminReportApi.ts에 별도로 둔다(엔드포인트가 다름).

// ── 타입 (백엔드 DTO와 1:1) ──────────────────────────────────────────────

/** 신고 대상 종류 — 게시글 / 게시글 댓글 / 회원 */
export type ReportTargetType = 'POST' | 'POST_COMMENT' | 'MEMBER';

/** 신고 사유 — ETC일 때만 content가 필수다(백엔드 REPORT_004). */
export type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'FRAUD' | 'ETC';

/** 신고 처리 상태 */
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** 요청 바디 — POST /api/reports */
export interface ReportCreatePayload {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  content: string | null; // ETC가 아니면 null
}

// ── API 함수 ─────────────────────────────────────────────────────────────

/**
 * 신고 접수 — POST /api/reports (201)
 * 응답 data가 null이라 반환값이 없다. 성공/실패 판정은 예외 발생 여부로만 한다.
 */
export async function createReport(payload: ReportCreatePayload): Promise<void> {
  await axiosInstance.post<ApiResponse<null>>('/reports', payload);
}
