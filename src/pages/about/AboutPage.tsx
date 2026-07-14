import { PawPrint, Heart, Home, Users } from 'lucide-react';

// 따숨 이야기 — 서비스 정체성 소개 (정적 페이지, 하드코딩 콘텐츠)
const VALUES = [
  { Icon: Heart, title: '따뜻한 연결', desc: '보호소에서 기다리는 아이들과 새 가족이 될 사람들을 이어줘요.' },
  { Icon: Home, title: '임시보호 문화', desc: '입양 전 임시보호로 서로를 알아가는 건강한 과정을 만들어요.' },
  { Icon: Users, title: '함께 나누는 경험', desc: '입양 후기와 반려 지식을 나누는 커뮤니티로 함께 성장해요.' },
];

export function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary py-14">
      <div className="mx-auto max-w-4xl px-6">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <PawPrint size={26} className="text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            따뜻한 숨결, <span className="text-ring">따숨</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            따숨은 유기동물에게 따뜻한 손길을 이어주는 임시보호 &amp; 커뮤니티 플랫폼이에요.
            전국 보호소의 아이들이 새 가족을 만나는 그날까지, 함께합니다.
          </p>
        </div>

        {/* 가치 카드 3개 */}
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-white p-6 text-center">
              <Icon size={28} className="mx-auto mb-3 text-ring" />
              <h2 className="mb-2 text-lg font-bold text-foreground">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* 데이터 출처 고지 — 공공데이터 활용 서비스의 신뢰 요소 */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          따숨의 유기동물 정보는 공공데이터포털의 동물보호관리시스템 데이터를 기반으로 제공됩니다.
        </p>
      </div>
    </div>
  );
}