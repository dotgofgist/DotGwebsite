import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminContactItem } from "../types";

type ContactItemListProps = {
  contactItems: AdminContactItem[];
};

export function ContactItemList({ contactItems }: ContactItemListProps) {
  if (contactItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold tracking-normal">등록된 연락처가 없습니다</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-500">새 연락처를 추가해 주세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {contactItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={item.isActive ? "success" : "default"}>
                  {item.isActive ? "활성" : "비활성"}
                </Badge>
                <span className="text-sm text-neutral-500">정렬 {item.sortOrder}</span>
              </div>
              <h3 className="text-lg font-semibold break-words">{item.label}</h3>
              <p className="text-sm font-medium break-words">{item.value}</p>
              {item.href ? <p className="text-sm text-primary break-words">{item.href}</p> : null}
              {item.description ? (
                <p className="text-sm leading-6 text-neutral-500">{item.description}</p>
              ) : null}
            </div>
            <Link
              className={buttonClasses({ variant: "secondary" })}
              href={`/admin/settings/contacts/${item.id}/edit`}
            >
              수정
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
