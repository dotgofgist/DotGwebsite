import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "../types";

type ProjectFormProps = {
  initialProject?: Project;
};

export function ProjectForm({ initialProject }: ProjectFormProps) {
  const tagValue = initialProject?.tags.join("\n") ?? "";
  const memberValue =
    initialProject?.members
      .map((member) => `${member.name} - ${member.role}`)
      .join("\n") ?? "";

  return (
    <form className="grid gap-6 rounded-lg border border-border bg-surface p-6">
      {/* TODO: 프로젝트 저장 Server Action 연결 */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="project-title" label="프로젝트 이름" required>
          <Input id="project-title" name="title" required defaultValue={initialProject?.title} />
        </FormField>
        <FormField htmlFor="project-slug" label="slug" required>
          <Input id="project-slug" name="slug" required defaultValue={initialProject?.slug} />
        </FormField>
      </div>
      <FormField htmlFor="project-summary" label="짧은 설명" required>
        <Textarea id="project-summary" name="summary" required defaultValue={initialProject?.summary} />
      </FormField>
      <FormField htmlFor="project-description" label="상세 설명" required>
        <Textarea id="project-description" name="description" required defaultValue={initialProject?.description} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="project-status" label="상태">
          <Select id="project-status" name="status" defaultValue={initialProject?.status ?? "planning"}>
            <option value="planning">기획 중</option>
            <option value="developing">개발 중</option>
            <option value="released">공개됨</option>
          </Select>
        </FormField>
        <FormField htmlFor="project-thumbnail" label="대표 이미지 경로">
          <Input id="project-thumbnail" name="thumbnailUrl" defaultValue={initialProject?.thumbnailUrl ?? ""} />
        </FormField>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="project-featured" name="featured" defaultChecked={initialProject?.featured} />
        <label className="text-sm font-medium" htmlFor="project-featured">
          대표 프로젝트로 표시
        </label>
      </div>
      <FormField htmlFor="project-tags" label="태그" description="한 줄에 하나씩 입력">
        <Textarea id="project-tags" name="tags" defaultValue={tagValue} />
      </FormField>
      <FormField htmlFor="project-members" label="참여 구성원" description="예: 기획 팀 - 플레이 경험 설계">
        <Textarea id="project-members" name="members" defaultValue={memberValue} />
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
