import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "../types";

const statusLabels: Record<ProjectStatus, string> = {
  planning: "기획 중",
  developing: "개발 중",
  released: "공개됨",
  archived: "보관",
};

const statusTones: Record<ProjectStatus, "default" | "primary" | "success"> = {
  planning: "default",
  developing: "primary",
  released: "success",
  archived: "default",
};

export function getProjectStatusLabel(status: ProjectStatus): string {
  return statusLabels[status];
}

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}
