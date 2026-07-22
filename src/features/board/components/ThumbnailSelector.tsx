import { EditorImage } from '@/shared/components/editor';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/components/ui/utils';

// 본문에 삽입된 이미지 중 목록 대표 이미지(is_thumbnail)를 고르는 선택 UI.
// 백엔드 IMAGE_FLOW의 "대표 이미지는 사용자가 명시적으로 지정" 결정을 프론트에서 충족한다.
// - 이미지가 없으면 렌더하지 않는다(선택할 대상이 없음).
// - 무선택 상태의 기본값(본문 첫 이미지)은 호출부가 계산해 selectedKey로 내려준다.
// - key는 imageId(기존 이미지) 또는 localId(미업로드 blob) 기반 — 저장 시 확정 imageId로 변환된다.

interface ThumbnailSelectorProps {
  images: EditorImage[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

export function ThumbnailSelector({
  images,
  selectedKey,
  onSelect,
}: ThumbnailSelectorProps) {
  if (images.length === 0) return null;

  return (
    <div className='space-y-2'>
      <Label>대표 이미지</Label>
      <p className='text-sm text-muted-foreground'>
        게시글 목록에 노출될 이미지를 선택하세요. 선택하지 않으면 본문의 첫 번째
        이미지가 사용됩니다.
      </p>
      <ul
        role='radiogroup'
        aria-label='대표 이미지 선택'
        className='flex flex-wrap gap-2'
      >
        {images.map((image, index) => {
          const isSelected = image.key === selectedKey;
          return (
            <li key={image.key}>
              <button
                type='button'
                role='radio'
                aria-checked={isSelected}
                aria-label={`${index + 1}번째 이미지를 대표 이미지로 지정`}
                onClick={() => onSelect(image.key)}
                className={cn(
                  'relative block overflow-hidden rounded-md border-2 transition-colors',
                  isSelected
                    ? 'border-primary'
                    : 'border-transparent hover:border-border',
                )}
              >
                <img src={image.src} alt='' className='size-24 object-cover' />
                {isSelected && (
                  <span className='absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 text-center text-xs text-primary-foreground'>
                    대표
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
