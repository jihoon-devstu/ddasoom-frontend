import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateQna } from '@/features/qna/hooks/useQnas';
import { MAX_QNA_IMAGES } from '@/features/qna/types';
import { ImageAttachInput } from '@/shared/components/common/ImageAttachInput';
import type { UploadedImage } from '@/shared/components/editor/editorImageApi';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

// 제목·내용만 폼(RHF)으로 검증한다. 첨부 이미지는 선업로드 방식이라 imageId 목록을 폼 밖 state로 관리.
// 백엔드 제약: title VARCHAR(255) NOT NULL
const qnaSchema = z.object({
  title: z.string().min(1, '제목을 입력해 주세요.').max(255, '제목은 255자를 초과할 수 없습니다.'),
  content: z.string().min(1, '문의 내용을 입력해 주세요.'),
});
type QnaForm = z.infer<typeof qnaSchema>;

export function QnaWritePage() {
  const navigate = useNavigate();
  const createQna = useCreateQna();
  const [images, setImages] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QnaForm>({
    resolver: zodResolver(qnaSchema),
    defaultValues: { title: '', content: '' },
  });

  const onSubmit = async (form: QnaForm) => {
    try {
      const created = await createQna.mutateAsync({
        title: form.title,
        content: form.content,
        imageIds: images.map((image) => image.imageId),
      });
      navigate(`/support/qnas/${created.qnaId}`);
    } catch {
      return; // 실패 시 입력 내용을 유지해 재시도할 수 있게 한다
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">1:1 문의하기</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input id="title" {...register('title')} placeholder="문의 제목을 입력하세요" />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            {...register('content')}
            rows={10}
            placeholder="문의 내용을 자세히 입력해 주세요"
          />
          {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>첨부 이미지 (선택)</Label>
          <ImageAttachInput
            ownerType="QNA"
            value={images}
            onChange={setImages}
            maxImages={MAX_QNA_IMAGES}
            disabled={createQna.isPending}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createQna.isPending}>
            {createQna.isPending ? '등록 중…' : '등록'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/support/qnas')}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
