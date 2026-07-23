"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  removeProjectThumbnailAction,
  updateProjectThumbnailAction,
  type ProjectImageActionState,
} from "../image-actions";
import type { AdminProject } from "../types";
import { ProjectThumbnailPreview } from "./project-thumbnail-preview";
import { ProjectThumbnailSubmitButton } from "./project-thumbnail-submit-button";

type ProjectThumbnailFormProps = {
  project: AdminProject;
};

const initialState: ProjectImageActionState = {
  status: "idle",
};

export function ProjectThumbnailForm({ project }: ProjectThumbnailFormProps) {
  const [state, formAction] = useActionState(
    updateProjectThumbnailAction,
    initialState,
  );
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  return (
    <section className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">대표 이미지</h2>
        <p className="mt-1 text-sm leading-6 text-neutral-500">
          JPEG, PNG, WebP 이미지를 5MB 이하로 업로드할 수 있습니다.
        </p>
      </div>
      <ProjectThumbnailPreview project={project} />
      <form action={formAction} className="grid gap-4">
        <input name="projectId" type="hidden" value={project.id} />
        {state.message ? (
          <p
            className="rounded-md border border-border bg-background p-3 text-sm text-red-600"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}
        <FormField htmlFor="project-thumbnail-image" label="대표 이미지 파일" required>
          <Input
            accept="image/jpeg,image/png,image/webp"
            aria-invalid={Boolean(state.message)}
            id="project-thumbnail-image"
            name="image"
            required
            type="file"
          />
        </FormField>
        <ProjectThumbnailSubmitButton />
      </form>
      {project.thumbnailPath ? (
        <form action={removeProjectThumbnailAction} className="space-y-3">
          <input name="projectId" type="hidden" value={project.id} />
          {confirmingRemove ? (
            <div className="rounded-md border border-border bg-background p-3 text-sm leading-6">
              <p className="font-semibold">
                {project.title} 대표 이미지를 제거할까요?
              </p>
              <p className="text-neutral-500">
                DB 경로를 비우고 기존 Storage object 삭제를 시도합니다.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => setConfirmingRemove(false)}
                  type="button"
                  variant="secondary"
                >
                  취소
                </Button>
                <Button
                  aria-label={`${project.title} 대표 이미지 제거`}
                  type="submit"
                  variant="danger"
                >
                  제거
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setConfirmingRemove(true)}
              type="button"
              variant="danger"
            >
              대표 이미지 제거
            </Button>
          )}
        </form>
      ) : null}
    </section>
  );
}
