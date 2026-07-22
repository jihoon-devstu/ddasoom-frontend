import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DeferredImage } from './DeferredImage';
import { extractEditorImages, toImageKey } from './extractEditorImages';

function makeEditor(html: string): Editor {
  return new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, DeferredImage],
    content: html,
  });
}

describe('extractEditorImages', () => {
  it('업로드 완료 이미지는 imageId 기반 key를 갖는다', () => {
    const editor = makeEditor(
      '<p>a</p><img src="https://cdn/a.png" data-image-id="10">',
    );
    expect(extractEditorImages(editor)).toEqual([
      {
        key: toImageKey(10),
        src: 'https://cdn/a.png',
        imageId: 10,
        localId: null,
      },
    ]);
    editor.destroy();
  });

  it('미업로드 blob 이미지는 localId 기반 key를 갖는다', () => {
    const editor = makeEditor('<img src="blob:local" data-local-id="uuid-1">');
    expect(extractEditorImages(editor)).toEqual([
      {
        key: 'local:uuid-1',
        src: 'blob:local',
        imageId: null,
        localId: 'uuid-1',
      },
    ]);
    editor.destroy();
  });

  it('본문 등장 순서를 유지하고, id/localId가 없는 노드는 제외한다', () => {
    const editor = makeEditor(
      '<img src="https://cdn/a.png" data-image-id="3">' +
        '<img src="https://other.site/x.png">' +
        '<img src="blob:local" data-local-id="uuid-2">',
    );
    expect(extractEditorImages(editor).map((image) => image.key)).toEqual([
      toImageKey(3),
      'local:uuid-2',
    ]);
    editor.destroy();
  });
});
