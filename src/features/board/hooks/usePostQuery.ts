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
 * ⚠️ 조회수 중복 집계 방지는 서버(뷰어 단위 Redis dedup, TTL 30분)가 담당한다.
 *    따라서 프론트는 재방문 시 자유롭게 refetch해도 되며(타인의 조회수 반영),
 *    이전의 staleTime 캐시(재방문 시 조회수 미증가 원인)는 제거했다.
 */
export function usePostDetailQuery(postId: number | null) {
  return useQuery({
    queryKey: queryKeys.board.detail(postId ?? -1),
    queryFn: () => getPostDetail(postId as number),
    enabled: postId != null,
  });
}
