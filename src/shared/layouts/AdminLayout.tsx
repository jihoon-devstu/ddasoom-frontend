import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn } from '@/shared/components/ui/utils';
import { ExternalLink } from 'lucide-react';
import dogLogo from '@/assets/dog.png';

// 관리자 사이드바 메뉴 정의 — 새 관리 페이지 추가 시 해당 그룹 items에 한 줄만 추가
const MENU_GROUPS = [
  {
    label: '현황',
    items: [
      { label: '대시보드', path: '/admin' },
      { label: '통계', path: '/admin/statistics' },
    ],
  },
  {
    label: '임시보호',
    items: [
      { label: '임시보호 신청 관리', path: '/admin/fosters' },
      { label: '임시보호 중 관리', path: '/admin/active-fosters' },
    ],
  },
  {
    label: '커뮤니티 운영',
    items: [
      { label: '유저 관리', path: '/admin/members' },
      { label: '게시글 관리', path: '/admin/posts' },
      { label: '댓글 관리', path: '/admin/comments' },
      { label: '신고 관리', path: '/admin/reports' },
    ],
  },
  {
    label: '고객센터',
    items: [
      { label: '공지사항', path: '/admin/notices' },
      { label: 'FAQ', path: '/admin/faqs' },
      { label: 'QnA', path: '/admin/qnas' },
    ],
  },
] as const;

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className='flex min-h-screen'>
      {/* 사이드바 — 다크 네이비 */}
      <aside className="flex w-56 flex-col bg-slate-900 text-slate-100">
        <a href="/"
          className="group flex items-center gap-2.5 border-b border-slate-700 px-6 py-5 transition-colors hover:bg-slate-800"
          title="따숨 홈으로 이동"
        >
          <img src={dogLogo} alt="따숨" className="h-7 w-7 rounded-full object-cover" />
          <span className="text-lg font-semibold">
            따숨 <span className="text-slate-400">관리자</span>
          </span>
          <ExternalLink size={14} className="ml-auto text-slate-500 transition-colors group-hover:text-slate-300" />
        </a>

        <nav className='flex-1 space-y-6 px-3 py-4'>
          {MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <p className='px-3 pb-1 text-xs font-semibold text-slate-500'>
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  // 대시보드(/admin)만 정확 매칭, 나머지는 하위 경로 포함
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-slate-700 font-medium text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className='border-t border-slate-700 px-6 py-4 text-sm text-slate-400'>
          {user?.nickname ?? '관리자'}님
        </div>
      </aside>

      {/* 본문 영역 */}
      <main className='flex-1 bg-slate-50'>
        <Outlet />
      </main>
    </div>
  );
}
