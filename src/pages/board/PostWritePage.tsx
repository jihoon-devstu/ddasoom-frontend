import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';

import {
  RichTextEditor,
  type RichTextEditorHandle,
} from '@/shared/components/editor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useCreatePost } from '@/features/board/hooks/useCreatePost';
import { useUpdatePost } from '@/features/board/hooks/useUpdatePost';
import { usePostDetailQuery } from '@/features/board/hooks/usePostDetailQuery';
import { useAuthStore } from '@/shared/stores/authStore';
import { resolveBoard } from '@/features/board/types';
import { NotFoundPage } from '@/pages/NotFoundPage';

// 게시판 공통 작성/수정 겸용 페이지 (입양후기·강아지·고양이).
// - /board/:boardType/write          → 작성 모드
// - /board/:boardType/:postId/edit   → 수정 모드 (AdminNoticeFormPage의 new/edit 겸용 패턴 준수)
// boardType/카테고리는 slug → BOARD_BY_SLUG 설정에서 가져온다 (백엔드 화이트리스트와 일치).
// 수정 모드에서는 상세 조회 HTML(영구 URL + data-image-id)을 에디터 initialHtml로 주입한다.
// DeferredImage가 data-image-id를 파싱하므로 기존 이미지도 extractImageIds에 그대로 잡힌다.

// 제목·카테고리만 zod 로 검증. 본문(RichTextEditor)은 RHF 밖(ref)이라 제출 시점에 수동 검증한다.
const reviewSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(255, '제목은 255자 이하여야 합니다.'),
});
type ReviewForm = z.infer<typeof reviewSchema>;

export function PostWritePage() {
  const navigate = useNavigate();
  const { boardType: slug, postId } = useParams();
  const board = resolveBoard(slug);
  const isEdit = postId != null;
  const numericId = isEdit ? Number(postId) : null;

  const user = useAuthStore((s) => s.user);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // 수정 모드에서만 상세 조회. ⚠️ 백엔드 스펙상 조회수 +1 부수효과 있음(boardApi 주석 참고).
  const { data: post, isError } = usePostDetailQuery(numericId);

  // 이미지 업로드(getPayload) 구간은 mutation 밖이라 isPending 으로 안 잡힘 → 별도 상태로 전체를 덮는다.
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { category: '', title: '' },
  });

  // 수정 모드 — 상세 로드되면 폼 필드 채움. 본문은 에디터 initialHtml 로 초기화되므로 여기선 제외.
  useEffect(() => {
    if (isEdit && post) {
      reset({ category: post.category, title: post.title });
    }
  }, [isEdit, post, reset]);

  // 수정 모드 가드 — 실검증(403 BOARD_002)은 백엔드 몫, 여기선 UX용 선차단.
  // URL slug의 게시판과 실제 게시글 boardType이 다르면(잘못된 경로) 목록으로 돌려보낸다.
  useEffect(() => {
    if (!isEdit || !post || !board) return;
    if (post.boardType !== board.boardType) {
      toast.error('잘못된 경로입니다.');
      navigate(`/board/${slug}`, { replace: true });
      return;
    }
    if (user && post.author.memberId !== user.memberId) {
      toast.error('본인이 작성한 게시글만 수정할 수 있습니다.');
      navigate(`/board/${slug}`, { replace: true });
    }
  }, [isEdit, post, board, slug, user, navigate]);

  // 없거나 삭제된 게시글(BOARD_001) — 목록으로 돌려보낸다.
  useEffect(() => {
    if (isEdit && isError) {
      toast.error('게시글을 찾을 수 없습니다.');
      navigate(`/board/${slug}`, { replace: true });
    }
  }, [isEdit, isError, slug, navigate]);

  const onSubmit = async (form: ReviewForm) => {
    if (isSaving || !editorRef.current || !board) return;
    setIsSaving(true);
    try {
      // 1) 본문 이미지 일괄 업로드 + 확정 HTML/imageIds 획득.
      //    실패 시 에디터 내부가 안내 토스트를 띄우고 throw → 여기선 조용히 종료(중복 토스트 방지).
      let payload;
      try {
        payload = await editorRef.current.getPayload();
      } catch {
        return;
      }

      // 2) 본문 빈값 수동 검증. 빈 에디터의 HTML 은 <p></p> 형태 → 태그 제거 후 판단.
      const text = payload.html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, '')
        .trim();
      if (text.length === 0 && payload.imageIds.length === 0) {
        toast.error('내용을 입력해주세요.');
        return;
      }

      // 3) 게시글 저장. 성공 토스트/캐시 무효화는 각 mutation 훅의 onSuccess 가 담당.
      //    대표 이미지 정책: 본문 첫 이미지 = 썸네일 (작성과 동일 규칙 — 명시 선택 UI 도입 전까지 유지).
      //    수정 시 imageIds 는 "최종" 목록 — 빠진 기존 이미지는 백엔드 syncImages 가 soft delete.
      const body = {
        boardType: board.boardType,
        category: form.category,
        title: form.title,
        content: payload.html,
        imageIds: payload.imageIds,
        thumbnailImageId: payload.imageIds[0] ?? null,
      };
      let savedPostId: number;
      try {
        if (isEdit && numericId != null) {
          await updatePost.mutateAsync({ postId: numericId, payload: body });
          savedPostId = numericId;
        } else {
          savedPostId = await createPost.mutateAsync(body); // createPost는 postId 반환
        }
      } catch (err) {
        // 백엔드 ApiResponse.message 는 사용자 노출용 문구이므로 그대로 안내.
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message as string | undefined)
          : undefined;
        toast.error(
          message ??
            (isEdit
              ? '게시글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.'
              : '게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'),
        );
        return;
      }

      // 4) 저장 성공 후에만 임시 blob(IndexedDB) 정리 + 상세로 이동.
      await editorRef.current.cleanup();
      navigate(`/board/${slug}/${savedPostId}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 알 수 없는 slug → NotFound (BoardListPage와 동일 원칙)
  if (!board) return <NotFoundPage />;

  // 수정 모드: 상세 로드 전에는 에디터를 마운트하지 않는다.
  // useEditor 의 content 는 초기화 시점에만 반영되므로, 데이터 확보 후 initialHtml 과 함께 마운트해야 한다.
  if (isEdit && !post) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-8'>
        <p className='text-sm text-muted-foreground'>게시글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-xl font-semibold'>
        {board.label} {isEdit ? '수정' : '작성'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='category'>카테고리</Label>
          <Controller
            name='category'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id='category' className='w-40'>
                  <SelectValue placeholder='카테고리를 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  {board.categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className='text-sm text-destructive'>
              {errors.category.message}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='title'>제목</Label>
          <Input
            id='title'
            {...register('title')}
            placeholder='제목을 입력하세요'
          />
          {errors.title && (
            <p className='text-sm text-destructive'>{errors.title.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='content'>내용</Label>
          <RichTextEditor
            ref={editorRef}
            ownerType='POST'
            initialHtml={isEdit && post ? post.content : ''}
            placeholder='내용을 입력해주세요'
          />
        </div>

        <div className='flex gap-2'>
          <Button type='submit' disabled={isSaving}>
            {isSaving
              ? isEdit
                ? '수정 중...'
                : '등록 중...'
              : isEdit
                ? '수정 완료'
                : '등록'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate(`/board/${slug}`)}
            disabled={isSaving}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
