import type { Editor } from '@tiptap/react';

// 본문 등장 순서대로 이미지 노드를 추출한다. (대표 이미지 선택 UI 등 "저장 전" 화면용)
//
// key는 업로드 전/후를 아우르는 안정 식별자다.
// 지연 업로드 구조상 신규 이미지는 저장 시점까지 imageId가 없으므로,
// 선택 상태는 imageId(기존 이미지) 또는 localId(미업로드 blob) 기준으로 보관해야 한다.
// → 저장 시 getPayload()의 imageIdByKey로 확정 imageId를 되찾는다.
//
// imageId도 localId도 없는 노드(외부 URL 붙여넣기 등)는 우리 서버에 저장되는 이미지가
// 아니므로 제외한다. (extractImageIds의 대상 집합과 동일하게 유지)

export interface EditorImage {
  key: string; // 'id:{imageId}' | 'local:{localId}'
  src: string; // 미리보기용 — 확정 URL 또는 blob URL
  imageId: number | null;
  localId: string | null;
}

// 확정 imageId로부터 key를 만든다. (수정 화면에서 서버가 내려준 대표 이미지 preselect용)
export function toImageKey(imageId: number): string {
  return `id:${imageId}`;
}

export function extractEditorImages(editor: Editor): EditorImage[] {
  const images: EditorImage[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name !== 'image') return;

    const src = String(node.attrs.src ?? '');
    if (node.attrs.imageId) {
      const imageId = Number(node.attrs.imageId);
      images.push({ key: toImageKey(imageId), src, imageId, localId: null });
      return;
    }
    if (node.attrs.localId) {
      const localId = String(node.attrs.localId);
      images.push({ key: `local:${localId}`, src, imageId: null, localId });
    }
  });
  return images;
}
