import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/api/queryKeys';
import { deletePost } from '../api/boardApi';

// 게시글 삭제(soft delete). 성공 시:
// - 목록 무효화(삭제 글이 목록에서 사라지도록)
// - 상세/댓글 캐시는 remove — invalidate하면 삭제된 글을 재조회해 404가 뜨므로 제거가 맞다.
//   (detail(postId) 키는 하위 comments 키의 prefix라 댓글 캐시도 함께 제거된다)
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.board.detail(postId) });
      toast.success('게시글이 삭제되었습니다.');
    },
  });
}
