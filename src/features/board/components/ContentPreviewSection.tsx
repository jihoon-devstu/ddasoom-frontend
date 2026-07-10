import { useNavigate } from 'react-router-dom';
import { MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { PostPreview } from '@/features/board/types';

// 메인 페이지 게시글 미리보기 섹션 — 입양후기/펫 커뮤니티가 이 컴포넌트 하나를 공용한다.
// 데이터는 props로만 받는다(목업/실데이터 무관). listPath: "더보기"와 카드 클릭이 이동할 목록 경로.
interface ContentPreviewSectionProps {
  title: string;
  description: string;
  posts: PostPreview[];
  listPath: string;      // 예: '/board?category=review' — 실제 라우트는 board 담당자와 협의
  background?: 'white' | 'cream';
}

export function ContentPreviewSection({
  title, description, posts, listPath, background = 'white',
}: ContentPreviewSectionProps) {
  const navigate = useNavigate();

  return (
    <section className={`py-14 ${background === 'cream' ? 'bg-secondary' : 'bg-white'}`}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.postId}
              onClick={() => navigate(listPath)} // 상세 라우트 확정 전까지 목록으로 — 담당자 협의 후 상세 경로로 교체
              className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <div className="h-48 overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-white">
                    {post.category}
                  </span>
                  {/* 날짜/조회수 등 메타 정보만 text-xs 허용 (타이포 규칙) */}
                  <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                </div>
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-foreground transition-colors hover:text-primary">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{post.summary}</p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium text-ring">{post.authorNickname}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageCircle size={13} />{post.commentCount}</span>
                    <span className="flex items-center gap-1"><Eye size={13} />{post.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-full px-8" onClick={() => navigate(listPath)}>
            더보기
          </Button>
        </div>
      </div>
    </section>
  );
}