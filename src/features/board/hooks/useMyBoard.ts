import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { getMyComments, getMyPosts } from '../api/boardApi';

// 마이페이지 전용 조회 훅 묶음 (내가 쓴 글 / 내가 쓴 댓글).
// 인증 필수 API — 비로그인 401은 axios 인터셉터의 reissue 흐름이 처리한다.

/** 내가 쓴 글 목록 — boardType undefined = 전체 보드 */
export function useMyPostsQuery(params: { boardType?: string; page: number }) {
  return useQuery({
    queryKey: queryKeys.board.myPosts(params),
    queryFn: () => getMyPosts({ ...params, size: 10 }),
  });
}

/** 내가 쓴 댓글 목록 */
export function useMyCommentsQuery(page: number) {
  return useQuery({
    queryKey: queryKeys.board.myComments(page),
    queryFn: () => getMyComments(page),
  });
}
