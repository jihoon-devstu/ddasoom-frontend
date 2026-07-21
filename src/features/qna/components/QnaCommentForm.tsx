import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { ImageAttachInput } from '@/shared/components/common/ImageAttachInput';
import type { UploadedImage } from '@/shared/components/editor/editorImageApi';
import { MAX_QNA_IMAGES } from '../types';

// 코멘트 입력창 — 유저 재질문/관리자 답변 공용.
// 두 화면의 차이는 mutation과 문구뿐이라 onSubmit/label을 prop으로 받는다.
// ownerType은 항상 'QNA_COMMENT' (질문 첨부인 'QNA'와 구분).

interface QnaCommentFormProps {
  onSubmit: (payload: { content: string; imageIds: number[] }) => Promise<unknown>;
  isPending: boolean;
  placeholder: string;
  submitLabel: string;
}

export function QnaCommentForm({
  onSubmit,
  isPending,
  placeholder,
  submitLabel,
}: QnaCommentFormProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);

  const isEmpty = content.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || isPending) return;

    try {
      await onSubmit({
        content: content.trim(),
        imageIds: images.map((image) => image.imageId),
      });
    } catch {
      return; // 실패 시 입력 내용을 유지해 재시도할 수 있게 한다
    }
    setContent('');
    setImages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-border p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        disabled={isPending}
      />

      <ImageAttachInput
        ownerType="QNA_COMMENT"
        value={images}
        onChange={setImages}
        maxImages={MAX_QNA_IMAGES}
        disabled={isPending}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isEmpty || isPending}>
          {isPending ? '등록 중…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
