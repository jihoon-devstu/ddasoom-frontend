import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';


// USER 권한 가드(foster/apply, mypage 등 로그인 필요 경로).
// isAuthReady 이전에는 판단 금지 → 부트스트랩 완료 전에는 스피너만 노출(새로고침 시 튕김 방지).
// 판단은 authStore.user(role)로만. JWT를 직접 디코딩하지 않는다.
export function RequireAuth() {
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  if (!isAuthReady) {
    // 부트스트랩(reissue 1회) 완료 전 — 가드 판단을 미루고 로딩만 표시.
    return (
      <div className="grid min-h-full place-items-center text-muted-foreground">로딩 중…</div>
    );
  }

  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
