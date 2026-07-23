import type { Notice } from "../types";
import { NoticeEmptyState } from "./notice-empty-state";
import { NoticeItem } from "./notice-item";

type NoticeListProps = {
  notices: Notice[];
};

export function NoticeList({ notices }: NoticeListProps) {
  if (notices.length === 0) {
    return <NoticeEmptyState />;
  }

  return (
    <ul className="grid gap-4">
      {notices.map((notice) => (
        <li key={notice.id}>
          <NoticeItem notice={notice} />
        </li>
      ))}
    </ul>
  );
}
