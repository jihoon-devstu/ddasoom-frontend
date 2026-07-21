import axios from 'axios';
import type { ApiResponse } from '@/shared/types/api';

// QnA 전용 에러 처리 유틸.
// 401/403/네트워크 등 공통 에러는 axios 인터셉터가 처리하므로, 여기서는
// QnA 도메인 고유 코드(QNA_001/QNA_002)만 다룬다.

const QNA_ERROR_MESSAGES: Record<string, string> = {
  QNA_001: '존재하지 않는 문의입니다.',
  QNA_002: '접근할 수 없는 문의입니다.',
};

/** 에러에서 백엔드 에러 코드를 추출한다. 코드를 알 수 없으면 undefined. */
export function getErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  return (error.response?.data as ApiResponse<null> | undefined)?.code;
}

/**
 * QnA 상세 진입 실패가 "목록으로 돌려보내야 하는" 케이스인지 판별하고 안내 문구를 반환한다.
 * QNA_001/QNA_002가 아니면 null — 그 외 에러는 일반 에러 화면으로 수렴시킨다.
 */
export function getQnaAccessErrorMessage(error: unknown): string | null {
  const code = getErrorCode(error);
  return (code && QNA_ERROR_MESSAGES[code]) ?? null;
}
