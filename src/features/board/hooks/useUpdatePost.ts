import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePost } from '../api/boardApi';
import { queryKeys } from '@/shared/api/queryKeys';
import { PostUpdatePayload } from '../types';

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: number;
      payload: PostUpdatePayload;
    }) => updatePost(postId, payload),
    onSuccess: (_data, { postId }) => {
      // 목록(제목/썸네일 변경 반영) + 해당 상세만 무효화 — detail 전체 무효화 금지(불필요 refetch 방지).
      queryClient.invalidateQueries({ queryKey: queryKeys.board.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.board.detail(postId),
      });
      toast.success('게시글이 수정되었습니다.');
    },
  });
}
