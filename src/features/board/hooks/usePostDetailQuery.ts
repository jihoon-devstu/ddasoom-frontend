import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { getPostDetail } from '../api/boardApi';

// postId가 null이면(작성 모드) 조회하지 않는다 — 수정 모드에서만 enabled.
export function usePostDetailQuery(postId: number | null) {
  return useQuery({
    queryKey: queryKeys.board.detail(postId ?? 0),
    queryFn: () => getPostDetail(postId as number),
    enabled: postId != null,
  });
}
