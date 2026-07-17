import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { getPostDetail, getPosts } from '../api/boardApi';
import type { PostListParams } from '../types';

// enabled: slug가 유효할 때만 조회(잘못된 slug에서 헛 API 호출 방지).
export function usePostsQuery(params: PostListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.board.list(params),
    queryFn: () => getPosts(params),
    enabled,
  });
}

/**
 * 게시글 상세 조회.
 * postId가 유효한 숫자가 아니면(잘못된 URL) 조회를 스킵 — 페이지에서 NotFound 처리.
 * ⚠️ GET 상세는 서버 조회수 증가를 동반하므로 staleTime을 두어
 *    같은 세션 내 뒤로가기/재방문 시 불필요한 재조회(=조회수 중복 증가)를 줄인다.
 */
export function usePostDetailQuery(postId: number | null) {
  return useQuery({
    queryKey: queryKeys.board.detail(postId ?? -1),
    queryFn: () => getPostDetail(postId as number),
    enabled: postId != null,
    staleTime: 60 * 1000, // 1분 — 목록↔상세 왕복 시 조회수 중복 증가 완화
  });
}
