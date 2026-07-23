import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminSocialLink } from "../types";

type SocialLinkListProps = {
  socialLinks: AdminSocialLink[];
};

export function SocialLinkList({ socialLinks }: SocialLinkListProps) {
  if (socialLinks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold tracking-normal">등록된 SNS 링크가 없습니다</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-500">새 SNS 링크를 추가해 주세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {socialLinks.map((link) => (
        <Card key={link.id}>
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={link.isActive ? "success" : "default"}>
                  {link.isActive ? "활성" : "비활성"}
                </Badge>
                <span className="text-sm text-neutral-500">정렬 {link.sortOrder}</span>
                {!link.url ? <span className="text-sm text-neutral-500">URL 없음</span> : null}
              </div>
              <h3 className="text-lg font-semibold break-words">{link.label}</h3>
              <p className="text-sm font-medium break-words">{link.platform}</p>
              {link.url ? <p className="text-sm text-primary break-words">{link.url}</p> : null}
              {link.description ? (
                <p className="text-sm leading-6 text-neutral-500">{link.description}</p>
              ) : null}
            </div>
            <Link
              className={buttonClasses({ variant: "secondary" })}
              href={`/admin/settings/social-links/${link.id}/edit`}
            >
              수정
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
