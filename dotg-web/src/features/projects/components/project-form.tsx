"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction, updateProjectAction } from "../actions";
import type { AdminProject } from "../types";
import type { ProjectActionState } from "../validation";
import { ProjectSubmitButton } from "./project-submit-button";

type ProjectFormProps = {
  initialProject?: AdminProject;
  mode: "create" | "edit";
};

const initialState: ProjectActionState = {
  status: "idle",
};

function dateValue(value: string | undefined): string {
  return value?.slice(0, 10) ?? "";
}

export function ProjectForm({ initialProject, mode }: ProjectFormProps) {
  const action = mode === "create" ? createProjectAction : updateProjectAction;
  const [state, formAction] = useActionState(action, initialState);
  const tagValue = initialProject?.tags.join(", ") ?? "";
  const memberValue =
    initialProject?.members
      .map((member) => `${member.name}|${member.role}`)
      .join("\n") ?? "";
  const linkValue =
    initialProject?.links
      .map((link) => `${link.type}|${link.label}|${link.href}`)
      .join("\n") ?? "";

  return (
    <form action={formAction} className="grid gap-6 rounded-lg border border-border bg-surface p-6">
      {initialProject ? <input name="id" type="hidden" value={initialProject.id} /> : null}
      {state.message ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.title} htmlFor="project-title" label="프로젝트 이름" required>
          <Input id="project-title" name="title" required defaultValue={initialProject?.title ?? ""} />
        </FormField>
        <FormField error={state.fieldErrors?.slug} htmlFor="project-slug" label="slug" required>
          <Input id="project-slug" name="slug" required defaultValue={initialProject?.slug ?? ""} />
        </FormField>
      </div>

      <FormField error={state.fieldErrors?.summary} htmlFor="project-summary" label="요약" required>
        <Textarea id="project-summary" name="summary" required defaultValue={initialProject?.summary ?? ""} />
      </FormField>
      <FormField error={state.fieldErrors?.description} htmlFor="project-description" label="상세 설명" required>
        <Textarea id="project-description" name="description" required defaultValue={initialProject?.description ?? ""} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField error={state.fieldErrors?.status} htmlFor="project-status" label="개발 상태">
          <Select id="project-status" name="status" defaultValue={initialProject?.status ?? "planning"}>
            <option value="planning">기획 중</option>
            <option value="developing">개발 중</option>
            <option value="released">공개됨</option>
            <option value="archived">보관</option>
          </Select>
        </FormField>
        <FormField error={state.fieldErrors?.publicationStatus} htmlFor="project-publication-status" label="공개 상태">
          <Select
            id="project-publication-status"
            name="publicationStatus"
            defaultValue={initialProject?.publicationStatus ?? "draft"}
          >
            <option value="draft">초안</option>
            <option value="published">공개</option>
            <option value="archived">보관</option>
          </Select>
        </FormField>
        <FormField error={state.fieldErrors?.sortOrder} htmlFor="project-sort-order" label="정렬 순서">
          <Input
            id="project-sort-order"
            min={0}
            name="sortOrder"
            type="number"
            defaultValue={initialProject?.sortOrder ?? 0}
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.startedAt} htmlFor="project-started-at" label="시작일">
          <Input id="project-started-at" name="startedAt" type="date" defaultValue={dateValue(initialProject?.startedAt)} />
        </FormField>
        <FormField error={state.fieldErrors?.releasedAt} htmlFor="project-released-at" label="공개일">
          <Input id="project-released-at" name="releasedAt" type="date" defaultValue={dateValue(initialProject?.releasedAt)} />
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox id="project-featured" name="featured" defaultChecked={initialProject?.featured ?? false} />
        <label className="text-sm font-medium" htmlFor="project-featured">
          대표 프로젝트로 표시
        </label>
      </div>

      <FormField error={state.fieldErrors?.tags} htmlFor="project-tags" label="태그" description="쉼표로 구분해 입력">
        <Textarea id="project-tags" name="tags" defaultValue={tagValue} />
      </FormField>
      <FormField error={state.fieldErrors?.members} htmlFor="project-members" label="참여 구성원" description="한 줄에 이름|역할 형식으로 입력">
        <Textarea id="project-members" name="members" defaultValue={memberValue} />
      </FormField>
      <FormField error={state.fieldErrors?.links} htmlFor="project-links" label="외부 링크" description="한 줄에 type|label|https://url 형식으로 입력">
        <Textarea id="project-links" name="links" defaultValue={linkValue} />
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ProjectSubmitButton label={mode === "create" ? "프로젝트 생성" : "프로젝트 저장"} />
        <p className="text-sm leading-6 text-neutral-500">
          저장 시 관리자 권한과 Supabase RLS가 다시 검증됩니다.
        </p>
      </div>
    </form>
  );
}
