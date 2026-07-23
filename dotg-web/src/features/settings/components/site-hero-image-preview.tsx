import Image from "next/image";
import type { AdminSiteSettings } from "../types";

type SiteHeroImagePreviewProps = {
  settings: AdminSiteSettings;
};

export function SiteHeroImagePreview({ settings }: SiteHeroImagePreviewProps) {
  if (settings.heroImageUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-md border border-border bg-background">
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          height={540}
          sizes="(max-width: 768px) 100vw, 720px"
          src={settings.heroImageUrl}
          width={960}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-md border border-border bg-background text-sm text-neutral-500">
      등록된 Hero 이미지가 없습니다. 공개 메인에는 기본 배경이 표시됩니다.
    </div>
  );
}
