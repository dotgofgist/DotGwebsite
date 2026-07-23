import Image from "next/image";
import type { AdminSiteSettings } from "../types";

type SiteLogoPreviewProps = {
  settings: AdminSiteSettings;
};

export function SiteLogoPreview({ settings }: SiteLogoPreviewProps) {
  if (settings.logoUrl) {
    return (
      <div className="flex min-h-24 items-center rounded-md border border-border bg-background p-4">
        <Image
          alt={settings.name}
          className="max-h-16 w-auto object-contain"
          height={64}
          src={settings.logoUrl}
          width={192}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-24 items-center rounded-md border border-border bg-background p-4 text-sm text-neutral-500">
      등록된 로고 이미지가 없습니다. 공개 Header에는 텍스트 로고가 표시됩니다.
    </div>
  );
}
