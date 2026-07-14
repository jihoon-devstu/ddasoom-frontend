import { Search, HandHeart, MessageSquareText, CircleCheck } from 'lucide-react';

// 이용 안내 — 서비스 이용 절차 가이드 (정적 페이지, 하드코딩 콘텐츠)
const STEPS = [
  { Icon: Search, step: '01', title: '아이들 만나보기', desc: '유기동물 페이지에서 지역·품종으로 검색하고, 마음이 가는 아이에게 좋아요를 눌러 관심 목록을 만들어 보세요.' },
  { Icon: HandHeart, step: '02', title: '임시보호 신청하기', desc: '함께하고 싶은 아이가 생기면 임시보호를 신청해요. 연락처와 주거 환경 등 간단한 정보를 작성하면 관리자가 확인 후 연락드려요.' },
  { Icon: CircleCheck, step: '03', title: '승인 후 만나기', desc: '신청이 승인되면 마이페이지에서 진행 상태를 확인할 수 있어요. 보호 기간 동안 아이와 서로를 알아가 보세요.' },
  { Icon: MessageSquareText, step: '04', title: '경험 나누기', desc: '입양이나 임시보호 경험을 후기로 남기고, 커뮤니티에서 반려 지식을 나눠주세요. 다음 인연에게 큰 힘이 됩니다.' },
];

export function GuidePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary py-14">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">이용 안내</h1>
          <p className="text-lg text-muted-foreground">따숨과 함께 새 가족을 만나는 네 단계</p>
        </div>

        <ol className="space-y-4">
          {STEPS.map(({ Icon, step, title, desc }) => (
            <li key={step} className="flex gap-5 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon size={22} className="text-ring" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-widest text-ring">STEP {step}</p>
                <h2 className="mb-1 text-lg font-bold text-foreground">{title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          더 궁금한 점은 고객센터의 FAQ와 1:1 문의를 이용해 주세요.
        </p>
      </div>
    </div>
  );
}