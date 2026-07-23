import Image from "next/image";
import type { AdminProject } from "../types";

type ProjectThumbnailPreviewProps = {
  project: AdminProject;
};

export function ProjectThumbnailPreview({ project }: ProjectThumbnailPreviewProps) {
  if (project.thumbnailUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-md border border-border bg-background">
        <Image
          alt={`${project.title} 대표 이미지`}
          className="h-full w-full object-cover"
          height={360}
          sizes="(max-width: 768px) 100vw, 560px"
          src={project.thumbnailUrl}
          width={640}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-md border border-border bg-background text-sm text-neutral-500">
      대표 이미지가 등록되지 않았습니다.
    </div>
  );
}
