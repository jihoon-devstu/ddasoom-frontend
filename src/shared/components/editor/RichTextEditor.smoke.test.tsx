import 'fake-indexeddb/auto';
import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor';

// 확장 배선(StarterKit link 설정 + DeferredImage + Placeholder)과 툴바(useEditorState)가
// 런타임 에러 없이 마운트되는지 확인하는 스모크 테스트.
describe('RichTextEditor 마운트', () => {
  it('툴바와 초기 콘텐츠가 렌더된다', async () => {
    const ref = createRef<RichTextEditorHandle>();
    render(
      <RichTextEditor
        ref={ref}
        ownerType='NOTICE'
        initialHtml='<p>공지 본문</p>'
        placeholder='내용을 입력하세요'
      />,
    );

    // 에디터 준비 후 툴바 버튼이 나타남 (중복 확장 등록 등 배선 오류가 없음을 방증)
    // getBy*/findBy*는 대상이 없으면 throw하므로 반환값의 존재만으로 렌더를 단언한다.
    expect(await screen.findByLabelText('굵게')).toBeTruthy();
    expect(screen.getByLabelText('이미지 삽입')).toBeTruthy();
    expect(screen.getByText('공지 본문')).toBeTruthy();

    // ref 핸들 노출 확인
    expect(typeof ref.current?.getPayload).toBe('function');
    expect(typeof ref.current?.cleanup).toBe('function');
  });

  it('초기 본문의 이미지 목록을 onImagesChange로 통지한다', async () => {
    const onImagesChange = vi.fn();
    render(
      <RichTextEditor
        ownerType='POST'
        initialHtml='<p>본문</p><img src="https://cdn/a.png" data-image-id="5">'
        onImagesChange={onImagesChange}
      />,
    );

    await waitFor(() => expect(onImagesChange).toHaveBeenCalledTimes(1));
    expect(onImagesChange.mock.calls[0][0]).toEqual([
      { key: 'id:5', src: 'https://cdn/a.png', imageId: 5, localId: null },
    ]);
  });
});
