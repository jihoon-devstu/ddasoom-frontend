import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateReport } from '@/features/report/hooks/useReport';
import { REPORT_REASON_LABEL } from '@/features/report/util';
import type { ReportReason, ReportTargetType } from '@/features/report/api/reportApi';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

// 신고 모달 — 게시글/댓글/회원 어디서든 재사용하는 공용 컴포넌트.
// open 상태는 호출하는 화면이 소유한다(신고 버튼의 위치·문구가 화면마다 다르므로).
//
// 사용 예시:
//   const [reportOpen, setReportOpen] = useState(false);
//   <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>신고</Button>
//   <ReportModal
//     targetType="POST"
//     targetId={post.postId}
//     open={reportOpen}
//     onOpenChange={setReportOpen}
//   />

const REASON_ORDER: ReportReason[] = ['SPAM', 'ABUSE', 'INAPPROPRIATE', 'FRAUD', 'ETC'];

// ETC는 상세 내용이 필수(백엔드 REPORT_004) — 서버 왕복 전에 폼에서 먼저 막는다.
const reportSchema = z
  .object({
    reason: z.enum(['SPAM', 'ABUSE', 'INAPPROPRIATE', 'FRAUD', 'ETC'], {
      required_error: '신고 사유를 선택해 주세요.',
    }),
    content: z.string(),
  })
  .refine((form) => form.reason !== 'ETC' || form.content.trim().length > 0, {
    message: '기타 사유를 선택한 경우 상세 내용을 입력해 주세요.',
    path: ['content'],
  });
type ReportForm = z.infer<typeof reportSchema>;

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportModal({ targetType, targetId, open, onOpenChange }: ReportModalProps) {
  const createReport = useCreateReport();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: { content: '' }, // reason은 미선택 상태로 시작(라디오 기본 선택 없음)
  });

  // 닫았다 다시 열었을 때 이전 입력과 검증 메시지가 남지 않도록 초기화한다.
  useEffect(() => {
    if (!open) reset({ content: '' });
  }, [open, reset]);

  const reason = watch('reason');

  const onSubmit = async (form: ReportForm) => {
    try {
      await createReport.mutateAsync({
        targetType,
        targetId,
        reason: form.reason,
        content: form.reason === 'ETC' ? form.content.trim() : null,
      });
    } catch {
      return; // 실패 토스트는 훅이 띄운다 — 입력 내용을 유지해 재시도할 수 있게 모달을 닫지 않는다
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신고하기</DialogTitle>
          <DialogDescription>
            신고 사유를 선택해 주세요. 접수된 신고는 관리자가 확인 후 처리합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {REASON_ORDER.map((value) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`report-reason-${value}`} />
                      <Label htmlFor={`report-reason-${value}`} className="font-normal">
                        {REPORT_REASON_LABEL[value]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
          </div>

          {/* 기타를 고른 경우에만 상세 입력을 노출한다 */}
          {reason === 'ETC' && (
            <div className="space-y-2">
              <Label htmlFor="report-content">상세 내용</Label>
              <Textarea
                id="report-content"
                {...register('content')}
                rows={4}
                placeholder="신고 사유를 구체적으로 입력해 주세요"
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={createReport.isPending}>
              {createReport.isPending ? '접수 중…' : '신고'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
