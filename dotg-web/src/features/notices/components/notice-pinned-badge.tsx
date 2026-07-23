import { Badge } from "@/components/ui/badge";

type NoticePinnedBadgeProps = {
  pinned: boolean;
};

export function NoticePinnedBadge({ pinned }: NoticePinnedBadgeProps) {
  if (!pinned) {
    return null;
  }

  return <Badge tone="primary">고정</Badge>;
}
