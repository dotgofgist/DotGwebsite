import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Recruitment } from "../types";

type RecruitmentFormProps = {
  initialRecruitment: Recruitment;
};

export function RecruitmentForm({ initialRecruitment }: RecruitmentFormProps) {
  return (
    <form className="grid gap-6 rounded-lg border border-border bg-surface p-6">
      {/* TODO: 모집 정보 저장 Server Action 연결 */}
      <FormField htmlFor="recruitment-title" label="모집 제목" required>
        <Input id="recruitment-title" name="title" required defaultValue={initialRecruitment.title} />
      </FormField>
      <FormField htmlFor="recruitment-summary" label="요약" required>
        <Textarea id="recruitment-summary" name="summary" required defaultValue={initialRecruitment.summary} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="recruitment-status" label="모집 상태">
          <Select id="recruitment-status" name="status" defaultValue={initialRecruitment.status}>
            <option value="upcoming">모집 예정</option>
            <option value="open">모집 중</option>
            <option value="closed">모집 마감</option>
            <option value="always">상시 모집</option>
          </Select>
        </FormField>
        <FormField htmlFor="application-label" label="지원 버튼 라벨">
          <Input id="application-label" name="applicationLabel" defaultValue={initialRecruitment.applicationLabel} />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="starts-at" label="모집 시작일">
          <Input id="starts-at" name="startsAt" type="date" defaultValue={initialRecruitment.schedule.startsAt ?? ""} />
        </FormField>
        <FormField htmlFor="ends-at" label="모집 종료일">
          <Input id="ends-at" name="endsAt" type="date" defaultValue={initialRecruitment.schedule.endsAt ?? ""} />
        </FormField>
      </div>
      <FormField htmlFor="application-url" label="지원 링크" description="실제 외부 지원 URL이 확정된 경우에만 입력합니다.">
        <Input id="application-url" name="applicationUrl" type="url" defaultValue={initialRecruitment.applicationUrl ?? ""} />
      </FormField>
      <FormField htmlFor="target" label="모집 대상" description="한 줄에 하나씩 입력">
        <Textarea id="target" name="target" defaultValue={initialRecruitment.target.join("\n")} />
      </FormField>
      <FormField htmlFor="qualifications" label="지원 자격" description="한 줄에 하나씩 입력">
        <Textarea id="qualifications" name="qualifications" defaultValue={initialRecruitment.qualifications.join("\n")} />
      </FormField>
      <FormField htmlFor="activities" label="주요 활동" description="한 줄에 하나씩 입력">
        <Textarea id="activities" name="activities" defaultValue={initialRecruitment.activities.join("\n")} />
      </FormField>
      <FormField htmlFor="process" label="모집 절차" description="단계 제목과 설명은 한 줄 단위로 정리합니다.">
        <Textarea
          id="process"
          name="process"
          defaultValue={initialRecruitment.process
            .map((step) => `${step.title} - ${step.description}`)
            .join("\n")}
        />
      </FormField>
      <FormField htmlFor="contact" label="문의 안내">
        <Input
          id="contact"
          name="contact"
          defaultValue={
            initialRecruitment.contact
              ? `${initialRecruitment.contact.label}: ${initialRecruitment.contact.value}`
              : ""
          }
        />
      </FormField>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled type="submit">저장 준비 중</Button>
        <p className="text-sm leading-6 text-neutral-400">
          저장 기능은 Supabase 연결 후 활성화됩니다.
        </p>
      </div>
    </form>
  );
}
