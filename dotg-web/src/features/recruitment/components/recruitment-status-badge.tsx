import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "../types";

const publicationLabels: Record<ContentStatus, string> = {
  draft: "초안",
  published: "공개",
  archived: "보관",
};

const publicationTones: Record<
  ContentStatus,
  "default" | "primary" | "success" | "warning"
> = {
  draft: "warning",
  published: "success",
  archived: "default",
};

export function getPublicationStatusLabel(status: ContentStatus): string {
  return publicationLabels[status];
}

type PublicationStatusBadgeProps = {
  status: ContentStatus;
};

export function PublicationStatusBadge({
  status,
}: PublicationStatusBadgeProps) {
  return <Badge tone={publicationTones[status]}>{publicationLabels[status]}</Badge>;
}
