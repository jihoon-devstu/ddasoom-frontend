import axios from 'axios';
import type { ApiResponse } from '@/shared/types/api';
import type { ReportReason, ReportStatus, ReportTargetType } from './api/reportApi';

// 신고 도메인 공용 유틸 — 한글 라벨 맵 + 에러 코드 처리.
// features/qna/util.ts와 동일한 양식이다(getErrorCode는 그 파일에도 같은 구현이 있으나,
// features 간 직접 의존을 늘리지 않으려 도메인마다 두는 기존 관행을 따랐다).

// ── 한글 라벨 (목록/상세/모달 공용) ──────────────────────────────────────

export const REPORT_TARGET_TYPE_LABEL: Record<ReportTargetType, string> = {
  POST: '게시글',
  POST_COMMENT: '댓글',
  MEMBER: '회원',
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  SPAM: '스팸/광고',
  ABUSE: '욕설/비방',
  INAPPROPRIATE: '부적절한 내용',
  FRAUD: '사기/허위',
  ETC: '기타',
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

// ── 에러 처리 ────────────────────────────────────────────────────────────

// 401/403/네트워크 등 공통 에러는 axios 인터셉터가 처리하므로 여기서는 신고 도메인 고유 코드만 다룬다.
// 인터셉터는 토스트를 띄우지 않으므로 아래 문구가 유일한 사용자 안내다.
const REPORT_ERROR_MESSAGES: Record<string, string> = {
  REPORT_002: '이미 신고한 대상입니다.',
  REPORT_003: '이미 처리된 신고입니다.',
  REPORT_004: '기타 사유는 상세 내용을 입력해 주세요.', // 폼 검증으로 도달 방지 — 방어적 문구
  REPORT_005: '본인은 신고할 수 없습니다.',
  MEMBER_007: '관리자 계정은 제재할 수 없습니다 — 반려로 처리하세요.',
};

/** 에러에서 백엔드 에러 코드를 추출한다. 코드를 알 수 없으면 undefined. */
export function getErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  return (error.response?.data as ApiResponse<null> | undefined)?.code;
}

/** 신고 도메인 고유 에러의 안내 문구. 아는 코드가 아니면 fallback 문구를 돌려준다. */
export function getReportErrorMessage(error: unknown, fallback: string): string {
  const code = getErrorCode(error);
  return (code && REPORT_ERROR_MESSAGES[code]) ?? fallback;
}
