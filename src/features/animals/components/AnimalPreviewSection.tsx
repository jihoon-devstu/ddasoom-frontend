import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Search, Dog, Cat, Heart, MapPin } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import type { AnimalPreview } from '@/features/animals/types';

// 메인 페이지 "유기동물 미리보기" 섹션 — 검색바(유기동물 목록으로 진입) + 카드 그리드.
// 데이터는 props로만 받는다(목업/실데이터 무관). 검색은 필터를 쿼리로 실어 /animals 로 이동만 한다.
// ⚠️ 시/도·군/구 목록은 피그마 데모 데이터 — 실제 지역 필터 스펙(공공API 지역코드)은 유기동물 담당자와 협의 후 교체.
const SIDO_LIST = ['시/도 전체', '서울', '경기', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const SIGUNGU_MAP: Record<string, string[]> = {
  서울: ['군/구 전체', '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  경기: ['군/구 전체', '수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '광명시', '김포시', '군포시', '광주시', '이천시', '양주시'],
  부산: ['군/구 전체', '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
};

// kind/gender 코드 → 표시 문자열 (DB는 원본 코드 저장, 변환은 프론트 책임)
const KIND_LABEL: Record<AnimalPreview['kind'], string> = { D: '강아지', C: '고양이' };
const GENDER_LABEL: Record<AnimalPreview['gender'], string> = { M: '수컷', F: '암컷', Q: '미상' };

// 이미지 NULL(공공API 미제공) 대비 placeholder
const FALLBACK_IMAGE = 'https://placehold.co/400x300/FFF3D6/9C8B75?text=%F0%9F%90%BE';

export function AnimalPreviewSection({ animals }: { animals: AnimalPreview[] }) {
  const navigate = useNavigate();
  const [species, setSpecies] = useState<'전체' | '강아지' | '고양이'>('전체');
  const [sido, setSido] = useState<string>('');
  const [sigungu, setSigungu] = useState<string>('');

  // 시/도 선택에 따라 군/구 목록 연동 — 시/도 변경 시 군/구는 리셋 (피그마 원본 동작)
  const sigunguList =
    sido && sido !== '시/도 전체' && SIGUNGU_MAP[sido] ? SIGUNGU_MAP[sido] : ['군/구 전체'];

  const handleSidoChange = (value: string) => {
    setSido(value);
    setSigungu('');
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (species !== '전체') params.set('species', species);
    if (sido && sido !== '시/도 전체') params.set('sido', sido);
    if (sigungu && sigungu !== '군/구 전체') params.set('sigungu', sigungu);
    navigate(`/animals?${params.toString()}`); // 필터 파라미터 스펙은 목록 페이지(담당자)와 협의
  };

  return (
    <section className="bg-secondary py-14">
      <div className="mx-auto max-w-6xl px-6">
        {/* ── 검색바: [강아지|고양이 토글] | [시/도] [군/구] [검색] ── */}
        <div className="mb-8 flex items-stretch gap-3 rounded-2xl border border-border bg-white p-4">
          {([
            { type: '강아지', Icon: Dog },
            { type: '고양이', Icon: Cat },
          ] as const).map(({ type, Icon }) => {
            const active = species === type;
            return (
              <button
                key={type}
                onClick={() => setSpecies(active ? '전체' : type)}
                className={`flex w-[90px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] py-2 transition-all ${
                  active ? 'border-ring bg-secondary text-ring' : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                <Icon size={28} />
                <span className="text-sm font-semibold">{type}</span>
              </button>
            );
          })}

          <div className="w-px bg-border" />

          {/* 시/도 — 피그마 비율(flex-[2]) 유지 */}
          <div className="flex flex-[2] items-center">
            <Select value={sido} onValueChange={handleSidoChange}>
              <SelectTrigger className="h-full w-full rounded-xl bg-secondary text-base">
                <SelectValue placeholder="시 / 도" />
              </SelectTrigger>
              <SelectContent>
                {SIDO_LIST.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 군/구 — 시/도 연동 */}
          <div className="flex flex-[2] items-center">
            <Select value={sigungu} onValueChange={setSigungu}>
              <SelectTrigger className="h-full w-full rounded-xl bg-secondary text-base">
                <SelectValue placeholder="군 / 구" />
              </SelectTrigger>
              <SelectContent>
                {sigunguList.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} className="shrink-0 gap-2 self-stretch rounded-xl px-6 text-base font-bold">
            <Search size={16} />
            검색
          </Button>
        </div>

        {/* ── 섹션 헤더 ── */}
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <PawPrint size={20} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">우리 아이들을 소개합니다</h2>
          </div>
          <p className="text-sm text-muted-foreground">새 가족을 기다리는 아이들이에요. 따뜻한 손을 내밀어 주세요.</p>
        </div>

        {/* ── 카드 그리드 ── */}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {animals.map((animal) => (
            <div
              key={animal.animalId}
              onClick={() => navigate(`/animals/${animal.animalId}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={animal.imageUrl ?? FALLBACK_IMAGE}
                  alt={animal.nickname}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* 상태 뱃지 — is_fostered 파생 (상세 상태 문구가 생기면 담당자와 협의해 교체) */}
                <span className="absolute left-3 top-3 rounded-full bg-ring px-2.5 py-0.5 text-xs font-medium text-white">
                  {animal.isFostered ? '임시보호중' : '임시보호가능'}
                </span>
                {/* ⚠️ [좋아요 담당자] 여기가 좋아요 연결 지점입니다.
                    onClick에 좋아요 토글 API 호출을 연결하고(stopPropagation 유지 — 카드 클릭과 분리),
                    채워진 하트 표시는 "내가 좋아요한 동물" 조회 결과와 대조해 fill 클래스로 처리하시면 됩니다. */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-3 top-3 flex items-center gap-1 text-white drop-shadow"
                >
                  <Heart size={18} />
                  <span className="text-xs font-semibold">{animal.likeCount}</span>
                </button>
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-baseline gap-2">
                  <h3 className="shrink-0 text-lg font-bold text-foreground">{animal.nickname}</h3>
                  {/* 유기번호 등 메타 정보만 text-xs 허용 (타이포 규칙) */}
                  <span className="truncate text-xs text-muted-foreground">{animal.abandonmentId}</span>
                </div>
                {/* age는 공공API 원본 문자열 그대로 표기 (파싱/가공 금지 — DB 컨벤션과 동일 원칙) */}
                <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
                  {KIND_LABEL[animal.kind]} · {animal.typeName} · {GENDER_LABEL[animal.gender]}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{animal.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-full px-8" onClick={() => navigate('/animals')}>
            더 많은 아이들 보기
          </Button>
        </div>
      </div>
    </section>
  );
}